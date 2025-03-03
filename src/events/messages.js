import config from "../configs/config.js";
import { Serialize } from "../lib/serialize.js";
import { handleMessagesUpsert } from "../handler.js";

export default async (client, store) => {
  client.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages[0].message) return;

    let m = await Serialize(client, messages[0], store);

    if (store.groupMetadata && Object.keys(store.groupMetadata).length === 0) {
      store.groupMetadata = await client.groupFetchAllParticipating();
    }

    if (config.autoRead.message && m.key && !m.key.fromMe) {
      await client.readMessages([m.key]);
    }

    await handleMessagesUpsert(client, store, m, messages);
  });
};