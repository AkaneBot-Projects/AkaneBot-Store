import fs from "fs";
import path from "path";

export default {
  cmd: ["getcmd"],
  name: ["getcmd"],
  tags: ["owner"],
  description: "Menampilkan daftar plugin atau isi file plugin tertentu.",

  execute: async function (m, { args, config }) {
    const basePath = `./${config.commands}`;
    
    if (!args[0]) {
      let response = "📂 *Daftar Plugins:*\n\n";

      function listFiles(dir, parent = "") {
        let files = fs.readdirSync(dir);
        for (let file of files) {
          let fullPath = path.join(dir, file);
          let stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            listFiles(fullPath, `${parent}${file}/`);
          } else if (file.endsWith(".js")) {
            response += `- ${parent}${file.replace(".js", "")}\n`;
          }
        }
      }

      listFiles(basePath);
      return m.reply(response || "❌ Tidak ada plugin yang ditemukan.");
    }

    const targetPath = path.join(basePath, args[0]);

    if (!fs.existsSync(targetPath)) return m.reply("❌ File tidak ditemukan!");

    try {
      const fileContent = fs.readFileSync(targetPath, "utf-8");
      return m.reply(`📄 *Isi file ${args[0]}:*\n\n\`\`\`${fileContent}\`\`\``);
    } catch (err) {
      console.error(err);
      return m.reply("❌ Gagal membaca file.");
    }
  },
};