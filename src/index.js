import config from "./configs/config.js";
import baileys from "@whiskeysockets/baileys";
import { createClient, getWAVersion } from "./lib/client.js";
import fs from "fs";

import {
  plugins,
  loadPluginFiles,
  pluginFolder,
  pluginFilter,
} from "./configs/plugins.js";
import { loadScraperFiles, scraperFolder, scraperFilter } from "./configs/scrapers.js";
import groupEvents from "./events/groups.js";
import messageHandler from "./events/messages.js";
import connectionUpdate from "./events/connection.js";
import Database from "./configs/database.js";

const { delay, jidNormalizedUser } = baileys;
const pairingCode = config.pairingNumber;
const pathContacts = `./${config.session}/contacts.json`;
const pathMetadata = `./${config.session}/groupMetadata.json`;

// Untuk melacak kapan terakhir kali database ditulis
let lastDatabaseWrite = new Date();

async function WAStart() {
  process.on("uncaughtException", console.error);
  process.on("unhandledRejection", console.error);

  const { version, isLatest } = await getWAVersion();
  console.log(`Menggunakan WA v${version.join(".")}, isLatest: ${isLatest}`);

  const { client, saveCreds, store } = await createClient({
    session: config.session,
  });

  const database = new Database();
  const content = await database.read();
  
  if (!content || Object.keys(content).length === 0) {
    global.db = {
      users: {},
      groups: {},
      settings: {},
      ...(content || {}),
    };

    await database.write(global.db);
    client.logger.info("Database has been initialized successfully.");
  } else {
    global.db = content;
    client.logger.info("Database loaded successfully.");
  }

  if (pairingCode && !client.authState.creds.registered) {
    let phoneNumber = pairingCode.replace(/[^0-9]/g, "");
    await delay(3000);
    let code = await client.requestPairingCode(phoneNumber);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    console.log(`⚠︎ Kode WhatsApp kamu: ${code}`);
  }

  try {
    await loadPluginFiles(pluginFolder, pluginFilter, {
      logger: client.logger,
      recursiveRead: true,
    })
      .then((plugins) => client.logger.info("Plugins Loader Success!"))
      .catch(console.error);

    await loadScraperFiles(scraperFolder, scraperFilter, {
    	logger: client.logger,
    	recursiveRead: true,
    })
      .then((plugins) => client.logger.info("Scraper Loader Success!"))
      .catch(client.logger.error);
  } catch (error) {
    client.logger.error("Error:", error.message);
  }

  connectionUpdate(client, WAStart);
  groupEvents(client, store);
  messageHandler(client, store);

  client.ev.on("creds.update", saveCreds);

  setInterval(async () => {
    if (store.groupMetadata) {
      fs.writeFileSync(pathMetadata, JSON.stringify(store.groupMetadata));
    }
    if (store.contacts) {
      fs.writeFileSync(pathContacts, JSON.stringify(store.contacts));
    }
    if (config.writeStore) {
      store.writeToFile(`./${config.session}/store.json`);
    }
    
    const now = new Date();
    const daysSinceLastWrite = (now - lastDatabaseWrite) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastWrite >= 1) {
      if (global.db) {
        client.logger.info("Melakukan penyimpanan database harian...");
        await database.write(global.db);
        lastDatabaseWrite = now;
        client.logger.info("Database berhasil disimpan.");
      }
    }
  }, 30 * 1000);
  
  process.on('SIGINT', async () => {
    client.logger.info("Aplikasi akan ditutup, menyimpan database...");
    if (global.db) {
      await database.write(global.db);
    }
    process.exit(0);
  });
}

WAStart();