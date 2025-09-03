import { config } from "dotenv"
config()

export default {
  // Security: Move sensitive data to environment variables
  owner: process.env.OWNER_NUMBERS?.split(",") || ["6285888362486", "6285691464024"],
  pairingNumber: process.env.PAIRING_NUMBER || "628195107972",

  // Bot behavior settings
  self: process.env.SELF_MODE === "true" || false,
  autoRead: {
    story: process.env.AUTO_READ_STORY === "true" || true,
    storyEmoji: process.env.AUTO_READ_STORY_EMOJI === "true" || true,
    message: process.env.AUTO_READ_MESSAGE === "true" || false,
  },
  autoOnline: process.env.AUTO_ONLINE === "true" || true,
  storyReadInterval: Number.parseInt(process.env.STORY_READ_INTERVAL) || 1000,
  autoRestart: process.env.AUTO_RESTART || "350 MB",
  writeStore: process.env.WRITE_STORE === "true" || false,

  // File paths
  session: process.env.SESSION || "./.session",
  database: process.env.DATABASE || "database.json",
  mongoURi: process.env.MONGO_URI || "",
  commands: "commands",
  scrapers: "scraper",

  messages: {
    owner: "🔒 This feature is only accessible by the bot owner.",
    group: "👥 This feature is only available in groups.",
    private: "💬 This feature is only available in private chats.",
    admin: "👑 This feature is only available for group admins.",
    botAdmin: "🤖 Bot needs to be an admin to use this feature.",
    bot: "🤖 This feature is only available for the bot.",
    premium: "⭐ This is a premium feature. Please upgrade your account.",
    media: "📱 Please reply to a media message.",
    query: "❓ Please provide a query or parameter.",
    error: "❌ An error occurred. Please try again later.",
    quoted: "💬 Please reply to a message.",
    wait: "⏳ Please wait, processing your request...",
    urlInvalid: "🔗 Invalid URL provided. Please check and try again.",
    notFound: "🔍 No results found for your query.",
    register: "📝 Please register first by typing .register",
    limit: "⚡ You've reached your usage limit. Type .claim or upgrade to premium.",
    banned: "🚫 Your account has been banned from using this bot.",
    cooldown: "⏰ Please wait before using this command again.",
    maintenance: "🔧 This feature is currently under maintenance.",
  },

  performance: {
    maxConcurrentCommands: Number.parseInt(process.env.MAX_CONCURRENT_COMMANDS) || 10,
    commandCooldown: Number.parseInt(process.env.COMMAND_COOLDOWN) || 1000,
    maxMessageLength: Number.parseInt(process.env.MAX_MESSAGE_LENGTH) || 4096,
    databaseSaveInterval: Number.parseInt(process.env.DB_SAVE_INTERVAL) || 30000,
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    saveToFile: process.env.SAVE_LOGS === "true" || false,
    maxLogFiles: Number.parseInt(process.env.MAX_LOG_FILES) || 5,
  },
}
