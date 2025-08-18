import Database from "../../src/configs/database.js";

export default {
  cmd: ["savedb"],
  name: ["savedb"],
  tags: ["owner"],
  description: "Menyimpan database secara manual.",

  execute: async function (m) {
    const database = new Database();
    await database.read();

    try {
      await database.write(global.db);
      return m.reply("✅ Database berhasil disimpan!");
    } catch (err) {
      console.error(err);
      return m.reply("❌ Gagal menyimpan database.");
    }
  },
};
