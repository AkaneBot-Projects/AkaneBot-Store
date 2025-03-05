import fs from "fs";
import path from "path";

export default {
  cmd: ["savecmd"],
  name: ["savecmd"],
  tags: ["owner"],
  description: "Simpan plugin baru ke dalam folder commands.",
  
  isOwner: true, 
  isQuoted: true, 
  
  execute: async function (m, { client, args, config }) {
    if (!args[0]) return m.reply("❌ Format: .saveplugin <folder> <nama.js> (balas pesan berisi kode)");

    const [folder, filename] = args;
    if (!folder || !filename) return m.reply("❌ Harap masukkan nama folder dan file!");

    if (!filename.endsWith(".js")) return m.reply("❌ Nama file harus berformat `.js`");

    const basePath = `./${config.commands}`;
    const targetPath = path.join(basePath, folder, filename);
    
    if (!m.quoted || !m.quoted.text) return m.reply("❌ Balas pesan berisi kode plugin!");

    const pluginCode = m.quoted.text;
    
    if (!fs.existsSync(path.join(basePath, folder))) {
      return m.reply(`❌ Folder *${folder}* tidak ditemukan!`);
    }
    
    try {
      fs.writeFileSync(targetPath, pluginCode);
      m.reply(`✅ Plugin *${filename}* berhasil disimpan ke folder *${folder}*!`);
    } catch (err) {
      console.error(err);
      m.reply("❌ Gagal menyimpan plugin.");
    }
  },
};