import config from "./configs/config.js"
import baileys from "baileys"
import Color from "./lib/color.js"

import { ArifzynAPI } from "@arifzyn/api"
import { plugins } from "./configs/plugins.js"
import { scrapers } from "./configs/scrapers.js"
import { loadDatabase } from "./configs/localdb.js"
import Func from "./lib/function.js"

const { delay, jidNormalizedUser } = baileys
const API = new ArifzynAPI()

const commandCooldowns = new Map()
const userCommandCount = new Map()

const checkUserPermissions = (m, db) => {
  const userId = m.sender
  const user = db.users[userId] || {}

  return {
    isPrems: user.premium || m.isOwner,
    isVIP: user.VIP || m.isOwner,
    isBanned: user.banned || false,
    userLimit: user.limit || 0,
    userLevel: user.level || 1,
    userExp: user.exp || 0,
    lastCommand: user.lastCommand || 0,
  }
}

const checkGroupSettings = (m, db) => {
  if (!m.isGroup) return {}
  const group = db.groups[m.chat] || {}

  return {
    isMuted: group.mute || false,
    isWelcome: group.welcome || false,
    isLeave: group.leave || false,
    isAntilink: group.antilink || false,
    isAntispam: group.antispam || false,
    isNotification: group.notification || false,
    isNsfw: group.nsfw || false,
    isGame: group.game || true,
    commandPrefix: group.prefix || ".",
  }
}

const logMessage = async (client, m) => {
  if (!m.message) return

  try {
    const chatName = await client.getName(m.chat)
    const senderName = m.isGroup ? await client.getName(m.sender) : "Private"

    console.log(Color.cyan("📨 From:"), Color.cyan(chatName), Color.blueBright(`(${m.chat.slice(-12)}...)`))
    console.log(
      Color.yellowBright("👤 User:"),
      Color.yellowBright(m.isGroup ? `${senderName} (${m.sender.slice(-12)}...)` : "Private Chat"),
    )
    console.log(
      Color.greenBright("💬 Message:"),
      Color.greenBright((m.body || m.type).slice(0, 100) + (m.body?.length > 100 ? "..." : "")),
    )
  } catch (error) {
    console.log(Color.redBright("Error logging message:"), error.message)
  }
}

const checkPluginConditions = (plugin, m, groupSettings, userPerms) => {
  if (plugin.isOwner && !m.isOwner) return "owner"
  if (plugin.isPremium && !userPerms.isPrems) return "premium"
  if (plugin.isVIP && !userPerms.isVIP) return "premium" // VIP maps to premium message
  if (plugin.isGroup && !m.isGroup) return "group"
  if (plugin.isBotAdmin && !m.isBotAdmin) return "botAdmin"
  if (plugin.isAdmin && !m.isAdmin) return "admin"
  if (plugin.isPrivate && m.isGroup) return "private"
  if (plugin.isQuoted && !m.isQuoted) return "quoted"

  if (m.isGroup) {
    if (plugin.isNsfw && !groupSettings.isNsfw) return "This command requires NSFW to be enabled in this group."
    if (plugin.isGame && !groupSettings.isGame) return "Game commands are disabled in this group."
  }

  return false
}

const checkRateLimit = (userId, commandName) => {
  const now = Date.now()
  const cooldownKey = `${userId}:${commandName}`
  const lastUsed = commandCooldowns.get(cooldownKey) || 0

  if (now - lastUsed < config.performance.commandCooldown) {
    const remainingTime = Math.ceil((config.performance.commandCooldown - (now - lastUsed)) / 1000)
    return `Please wait ${remainingTime} seconds before using this command again.`
  }

  commandCooldowns.set(cooldownKey, now)

  // Clean up old entries (older than 1 hour)
  if (commandCooldowns.size > 1000) {
    for (const [key, timestamp] of commandCooldowns.entries()) {
      if (now - timestamp > 3600000) {
        commandCooldowns.delete(key)
      }
    }
  }

  return false
}

/**
 * Enhanced usage pattern checking with better validation
 */
const checkUsagePattern = (plugin, m) => {
  if (!plugin.usages || !Array.isArray(plugin.usages)) return false

  const { args, command, prefix } = m

  const matchingPattern = plugin.usages.find((usage) => {
    const pattern = usage[0].split(" ")
    const cmdName = pattern[0]
    const paramCount = pattern.slice(1).length
    return cmdName === command && paramCount === args.length
  })

  if (!matchingPattern) {
    const usageList = plugin.usages.map(([usage, desc]) => `◦ ${prefix}${usage}\n  ${desc}`).join("\n")

    return `❌ Invalid usage pattern\n\n*Usage Examples:*\n${usageList}`
  }

  return false
}

const handleMessagesUpsert = async (client, store, m, messages) => {
  const commandId = `${m.sender}:${Date.now()}`

  try {
    // Add to active commands tracking
    if (global.activeCommands) {
      global.activeCommands.add(commandId)
    }

    await loadDatabase(m)

    const quoted = m.isQuoted ? m.quoted : m

    // Early returns for better performance
    if (m.isBaileys) return
    if (config.self && !m.isOwner) return

    const userPerms = checkUserPermissions(m, global.db)
    const groupSettings = checkGroupSettings(m, global.db)

    // Check if group is muted
    if (m.isGroup && groupSettings.isMuted && !m.isOwner) return

    // Check if user is banned
    if (userPerms.isBanned && !m.isOwner) {
      await m.reply(config.messages.banned)
      return
    }

    await logMessage(client, m)

    for (const name in plugins) {
      const plugin = plugins[name]
      if (!plugin || plugin.disabled) continue

      try {
        // Execute 'all' function if available
        if (typeof plugin.all === "function") {
          await plugin.all.call(client, m, {
            messages,
            plugins,
            scrapers,
            API,
          })
        }

        // Execute 'before' function if available
        if (typeof plugin.before === "function") {
          if (
            await plugin.before.call(client, m, {
              client,
              messages,
              plugins,
              scrapers,
              API,
              Func,
            })
          )
            continue
        }

        // Process commands
        if (m.prefix) {
          const { args, text, prefix } = m
          const isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false
          const command = isCommand ? m.command.toLowerCase() : false

          const isAccept = Array.isArray(plugin.cmd) ? plugin.cmd.includes(command) : plugin.cmd === command

          if (!isAccept) continue

          m.plugin = name
          m.isCommand = true

          // Check rate limiting
          const rateLimitError = checkRateLimit(m.sender, command)
          if (rateLimitError && !m.isOwner) {
            await m.reply(rateLimitError)
            continue
          }

          // Check plugin conditions
          const conditionError = checkPluginConditions(plugin, m, groupSettings, userPerms)

          if (conditionError) {
            await m.reply(config.messages[conditionError] || conditionError)
            continue
          }

          // Check usage pattern
          const usageError = checkUsagePattern(plugin, m)
          if (usageError) {
            await m.reply(usageError)
            continue
          }

          // Check and deduct limit
          if (plugin.limit && !m.isOwner) {
            if (userPerms.userLimit < plugin.limit) {
              await m.reply(
                `❌ Insufficient limit to use this feature.\nRequired: ${plugin.limit}\nYour limit: ${userPerms.userLimit}`,
              )
              continue
            }

            // Initialize user if not exists
            if (!global.db.users[m.sender]) {
              global.db.users[m.sender] = { limit: 0, exp: 0, level: 1 }
            }

            global.db.users[m.sender].limit -= plugin.limit
          }

          // Execute plugin
          try {
            await plugin.execute(m, {
              client,
              command,
              prefix,
              args,
              text,
              quoted,
              plugins,
              scrapers,
              store,
              config,
              API,
              Func,
              userPerms,
              groupSettings,
            })

            // Award experience points
            if (plugin.exp && !m.isOwner) {
              const expGain = typeof plugin.exp === "number" ? plugin.exp : 1
              if (!global.db.users[m.sender]) {
                global.db.users[m.sender] = { limit: 0, exp: 0, level: 1 }
              }
              global.db.users[m.sender].exp += expGain
              global.db.users[m.sender].lastCommand = Date.now()
            }

            // Update statistics
            if (global.db.stats) {
              global.db.stats.commandsExecuted = (global.db.stats.commandsExecuted || 0) + 1
            }
          } catch (error) {
            console.error(Color.redBright(`❌ Error in plugin ${name}:`), error)
            await m.reply(config.messages.error)
          } finally {
            // Execute 'after' function if available
            if (typeof plugin.after === "function") {
              try {
                await plugin.after.call(m, { client })
              } catch (error) {
                console.error(Color.redBright(`❌ Error in after function of plugin ${name}:`), error)
              }
            }
          }
        }
      } catch (error) {
        console.error(Color.redBright(`❌ Error processing plugin ${name}:`), error)
      }
    }

    // Update message processing statistics
    if (global.db.stats) {
      global.db.stats.messagesProcessed = (global.db.stats.messagesProcessed || 0) + 1
    }
  } catch (error) {
    console.error(Color.redBright("❌ Critical error handling message:"), error)
  } finally {
    // Remove from active commands tracking
    if (global.activeCommands) {
      global.activeCommands.delete(commandId)
    }
  }
}

export { handleMessagesUpsert }
export default {
  handleMessagesUpsert,
}
