import { config } from "dotenv";
config();

export default {
  owner: ["6285888362486", "6285691464024"], // isi
  pairingNumber: "628195107972", // isi 
  self: true, 
  autoRead: {
    story: true,
    storyEmoji: true,
    message: false,
  },
  autoOnline: true,
  storyReadInterval: 1000,
  autoRestart: "350 MB",
  writeStore: false,
  session: process.env.SESSION || "./.session",
  database: process.env.DATABASE || "database.json",
  mongoURi: process.env.MONGO_URi || "",
  commands: "commands",
  scrapers: "scraper", 
  msg: {
    owner: "✧˚ ༘ ⋆｡˚ Hanya owner yang bisa akses fitur ini! ˚♡ ⋆｡˚ ✧",
    group: "✿°•∘ Fitur ini hanya untuk grup! ∘•°✿",
    private: "💌✧˚・ Fitur khusus chat pribadi saja! ・˚✧💌",
    admin: "👑✨ Khusus admin grup saja ya! ✨👑",
    botAdmin: "🌸 Bot belum jadi admin, tidak bisa menggunakan fitur ini! 🌸",
    bot: "🤖💕 Fitur ini hanya untuk bot saja",
    premium: "✧*。ヾ(｡>﹏<｡)ﾉﾞ✧*。 Fitur premium! Upgrade dulu ya~ ✧*。ヾ(｡>﹏<｡)ﾉﾞ✧*。",
    media: "📱✿ Reply ke media dulu ya! ✿📱",
    query: "❓🎀 Query-nya mana? 🎀❓",
    error: "ｏ(╥﹏╥)ｏ Terjadi kesalahan! Coba lagi nanti ya~ ｏ(╥﹏╥)ｏ",
    quoted: "💬✧˚ Reply ke pesan dulu ya! ˚✧💬",
    wait: "⋆⭒ Tunggu sebentar... ⭒⋆ \n┈┈┈┈┈┈┈┈┈┈┈┈\n(づ ◕‿◕ )づ loading...",
    urlInvalid: "✘✿ URL tidak valid! Coba URL yang lain ya~ ✿✘",
    notFound: "┏━━✦❘༻ 404 ༺❘✦━━┓\n  Hasil tidak ditemukan!  \n┗━━✦❘༻ 404 ༺❘✦━━┛",
    register: "✧･ﾟ: *✧･ﾟ:* Silakan daftar dulu ya! Ketik .register *:･ﾟ✧*:･ﾟ✧",
    limit: "⊹˚₊ Limit kamu habis! (っ °Д °;)っ \n⊹˚₊ Ketik .claim atau beli premium ya~ ₊˚⊹",
  },
};