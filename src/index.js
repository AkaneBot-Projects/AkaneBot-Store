import config from "./configs/config.js"
import baileys from "baileys"
import { createClient, getWAVersion } from "./lib/client.js"
import fs from "fs"

import { loadPluginFiles, pluginFolder, pluginFilter } from "./configs/plugins.js"
import { loadScraperFiles, scraperFolder, scraperFilter } from "./configs/scrapers.js"
import groupEvents from "./events/groups.js"
import messageHandler from "./events/messages.js"
import connectionUpdate from "./events/connection.js"
import Database from "./configs/database.js"

const { delay, jidNormalizedUser } = baileys
const pairingCode = config.pairingNumber
const pathContacts = `./${config.session}/contacts.json`
const pathMetadata = `./${config.session}/groupMetadata.json`

let lastDatabaseWrite = new Date()
let isShuttingDown = false
const activeCommands = new Set()

const setupErrorHandlers = (logger) => {
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error)
    if (!isShuttingDown) {
      gracefulShutdown(logger)
    }
  })

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason)
  })
}

const gracefulShutdown = async (logger, database = null) => {
  if (isShuttingDown) return
  isShuttingDown = true

  logger.info("Initiating graceful shutdown...")

  try {
    // Wait for active commands to complete (max 10 seconds)
    const shutdownTimeout = setTimeout(() => {
      logger.warn("Force shutdown due to timeout")
      process.exit(1)
    }, 10000)

    while (activeCommands.size > 0) {
      logger.info(`Waiting for ${activeCommands.size} active commands to complete...`)
      await delay(1000)
    }

    clearTimeout(shutdownTimeout)

    // Save database if available
    if (database && global.db) {
      logger.info("Saving database before shutdown...")
      await database.write(global.db)
      logger.info("Database saved successfully.")
    }

    logger.info("Graceful shutdown completed.")
    process.exit(0)
  } catch (error) {
    logger.error("Error during graceful shutdown:", error)
    process.exit(1)
  }
}

const initializeDatabase = async (database, logger) => {
  try {
    const content = await database.read()

    if (!content || Object.keys(content).length === 0) {
      global.db = {
        users: {},
        groups: {},
        settings: {
          initialized: new Date().toISOString(),
          version: "1.0.0",
        },
        stats: {
          commandsExecuted: 0,
          messagesProcessed: 0,
          startTime: new Date().toISOString(),
        },
        ...(content || {}),
      }

      await database.write(global.db)
      logger.info("Database initialized successfully with default structure.")
    } else {
      global.db = content
      logger.info("Database loaded successfully.")
    }

    return true
  } catch (error) {
    logger.error("Failed to initialize database:", error)
    return false
  }
}

const saveStoreFiles = async (store, logger) => {
  try {
    const operations = []

    if (store.groupMetadata) {
      operations.push(fs.promises.writeFile(pathMetadata, JSON.stringify(store.groupMetadata, null, 2)))
    }

    if (store.contacts) {
      operations.push(fs.promises.writeFile(pathContacts, JSON.stringify(store.contacts, null, 2)))
    }

    if (config.writeStore) {
      operations.push(store.writeToFile(`./${config.session}/store.json`))
    }

    await Promise.all(operations)
  } catch (error) {
    logger.error("Error saving store files:", error)
  }
}

async function WAStart() {
  const { version, isLatest } = await getWAVersion()
  console.log(`Using WhatsApp v${version.join(".")}, isLatest: ${isLatest}`)

  const { client, saveCreds, store } = await createClient({
    session: config.session,
  })

  setupErrorHandlers(client.logger)

  const database = new Database()
  const dbInitialized = await initializeDatabase(database, client.logger)

  if (!dbInitialized) {
    client.logger.error("Failed to initialize database. Exiting...")
    process.exit(1)
  }

  if (pairingCode && !client.authState.creds.registered) {
    try {
      const phoneNumber = pairingCode.replace(/[^0-9]/g, "")
      await delay(3000)
      let code = await client.requestPairingCode(phoneNumber)
      code = code?.match(/.{1,4}/g)?.join("-") || code
      console.log(`🔐 Your WhatsApp pairing code: ${code}`)
    } catch (error) {
      client.logger.error("Failed to request pairing code:", error)
    }
  }

  try {
    await Promise.all([
      loadPluginFiles(pluginFolder, pluginFilter, {
        logger: client.logger,
        recursiveRead: true,
      })
        .then(() => client.logger.info("✅ Plugins loaded successfully!"))
        .catch((error) => {
          client.logger.error("❌ Failed to load plugins:", error)
          throw error
        }),

      loadScraperFiles(scraperFolder, scraperFilter, {
        logger: client.logger,
        recursiveRead: true,
      })
        .then(() => client.logger.info("✅ Scrapers loaded successfully!"))
        .catch((error) => {
          client.logger.error("❌ Failed to load scrapers:", error)
          throw error
        }),
    ])
  } catch (error) {
    client.logger.error("Critical error during initialization:", error)
    process.exit(1)
  }

  // Initialize event handlers
  connectionUpdate(client, WAStart)
  groupEvents(client, store)
  messageHandler(client, store)

  client.ev.on("creds.update", saveCreds)

  const periodicTasks = setInterval(async () => {
    if (isShuttingDown) {
      clearInterval(periodicTasks)
      return
    }

    try {
      await saveStoreFiles(store, client.logger)

      const now = new Date()
      const hoursSinceLastWrite = (now - lastDatabaseWrite) / (1000 * 60 * 60)

      // Save database every hour instead of daily for better data safety
      if (hoursSinceLastWrite >= 1) {
        if (global.db) {
          client.logger.info("Performing periodic database save...")
          await database.write(global.db)
          lastDatabaseWrite = now
          client.logger.info("Database saved successfully.")
        }
      }
    } catch (error) {
      client.logger.error("Error in periodic tasks:", error)
    }
  }, config.performance.databaseSaveInterval)

  const shutdownHandler = () => gracefulShutdown(client.logger, database)
  process.on("SIGINT", shutdownHandler)
  process.on("SIGTERM", shutdownHandler)

  // Export active commands tracker for use in handlers
  global.activeCommands = activeCommands

  client.logger.info("🚀 Bot started successfully!")
}

WAStart().catch((error) => {
  console.error("Failed to start bot:", error)
  process.exit(1)
})