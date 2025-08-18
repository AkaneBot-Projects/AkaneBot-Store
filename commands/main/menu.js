const cmd = {
  cmd: ["menu", "help", "allmenu"],
  name: ["menu"],
  category: ["main"],
  description: "Menampilkan menu bot dengan tampilan kawaii",
};

cmd.execute = async (
  m,
  {
    client,
    args,
    prefix,
    command,
    text,
    plugins,
    API,
    Func,
    userPerms,
    groupSettings,
  },
) => {
  try {
    const commandsByCategory = {};

    // Helper function to ensure array format
    const ensureArray = (value) => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    };

    Object.keys(plugins).forEach((name) => {
      const plugin = plugins[name];
      if (!plugin || plugin.disabled) return;

      const commandNames = ensureArray(plugin.name);
      if (!commandNames.length) return;

      // Fix for typo in category name (cetegory -> category)
      const category = plugin.category || plugin.cetegory || "other";
      const categories = ensureArray(category);

      categories.forEach((category) => {
        // Skip uncategorized commands
        if (category.toLowerCase() === "uncategorized") return;

        if (!commandsByCategory[category]) {
          commandsByCategory[category] = new Map();
        }

        const cmdInfo = {
          names: commandNames,
          rowId: prefix + commandNames[0],
          isLimit: plugin.limit > 0,
          isPremium: plugin.isPremium,
          isVIP: plugin.isVIP,
          desc: plugin.desc || "No description",
        };

        commandsByCategory[category].set(commandNames[0], cmdInfo);
      });
    });

    const totalCommands = Object.values(commandsByCategory).reduce(
      (total, cmds) => total + cmds.size,
      0,
    );

    // Get cute kawaii emojis for categories
    const getCategoryEmoji = (category) => {
      const emojis = {
        main: "🌸",
        store: "🛍️",
        game: "🎮",
        fun: "🎀",
        tools: "🔮",
        downloader: "📥",
        converter: "✨",
        group: "👥",
        owner: "👑",
        admin: "🔰",
        search: "🔍",
        other: "🌟",
      };

      return emojis[category.toLowerCase()] || "✧";
    };

    // Kawaii borders and separators
    const topBorder = "╭・❀・・・・・・・・・・・❀・╮";
    const bottomBorder = "╰・❀・・・・・・・・・・・❀・╯";
    const midSeparator = "┈ ⋆ ┈ ⋆ ┈ ⋆ ┈ ⋆ ┈ ⋆ ┈ ⋆ ┈";

    // Time greeting based on hour
    const hour = new Date().getHours();
    let greeting = "";
    if (hour >= 5 && hour < 12) greeting = "Ohayou";
    else if (hour >= 12 && hour < 15) greeting = "Konnichiwa";
    else if (hour >= 15 && hour < 19) greeting = "Konbanwa";
    else greeting = "Oyasumi";

    let menuText = `${topBorder}\n`;
    menuText += `  ${greeting} ${m.pushName || "User"}-chan! ૮ ˶ᵔ ᵕ ᵔ˶ ა\n\n`;
    menuText += `  ⋆｡°✩ *Bot Info* ✩°｡⋆\n`;
    menuText += `  ✧ Prefix: ${prefix}\n`;
    menuText += `  ✧ Time: ${new Date().toLocaleTimeString()}\n`;
    menuText += `  ✧ Date: ${new Date().toLocaleDateString()}\n`;
    menuText += `  ✧ Commands: ${totalCommands}\n\n`;
    menuText += `  ⋆｡°✩ *User Info* ✩°｡⋆\n`;
    menuText += `  ✧ Status: ${userPerms.isPrems ? "✧Premium✧" : userPerms.isVIP ? "★VIP★" : "Regular"}\n`;
    menuText += `  ✧ Limit: ${userPerms.userLimit}\n`;
    menuText += `  ✧ Level: ${userPerms.userLevel}\n`;
    menuText += `  ✧ Exp: ${userPerms.userExp}\n`;
    menuText += `${midSeparator}\n\n`;

    // If text parameter is provided, show detailed help for specific command
    if (text) {
      const plugin = Object.values(plugins).find((plugin) => {
        if (plugin && plugin.name) {
          const names = ensureArray(plugin.name);
          return names.some((n) => n && n.toLowerCase() === text.toLowerCase());
        }
        return false;
      });

      if (plugin) {
        const allNames = ensureArray(plugin.name);
        const categories = ensureArray(plugin.category || plugin.cetegory);

        let helpText = `${topBorder}\n`;
        helpText += `  ✧･ﾟ: *✧ Command Detail ✧*:･ﾟ✧\n\n`;
        helpText += `  ❀ Names: ${allNames.map((n) => prefix + n).join(", ")}\n`;
        helpText += `  ❀ Category: ${categories.join(", ") || "Other"}\n`;
        helpText += `  ❀ Description: ${plugin.description || "No description"}\n`;

        if (plugin.usages && plugin.usages.length > 0) {
          helpText += `\n  ✧･ﾟ: *✧ Usage Examples ✧*:･ﾟ✧\n`;
          plugin.usages.forEach(([usage, desc]) => {
            helpText += `  ❀ ${prefix}${usage}\n    ${desc}\n`;
          });
        } else {
          helpText += `  ❀ Usage: ${prefix}${allNames[0]} ${Object.entries(
            plugin.options || {},
          )
            .map(([k, v]) => `<${v}>`)
            .join(" ")}\n\n`;

          helpText += `  ✧･ﾟ: *✧ Options ✧*:･ﾟ✧\n`;
          Object.entries(plugin.options || {}).forEach(([key, value]) => {
            helpText += `  ❀ ${key}: ${value}\n`;
          });
        }

        helpText += `\n  ✧･ﾟ: *✧ Requirements ✧*:･ﾟ✧\n`;
        helpText += `${plugin.isGroup ? "  ❀ Group\n" : ""}`;
        helpText += `${plugin.isAdmin ? "  ❀ Admin Group\n" : ""}`;
        helpText += `${plugin.isBotAdmin ? "  ❀ Bot Admin\n" : ""}`;
        helpText += `${plugin.isPrivate ? "  ❀ Private Chat\n" : ""}`;
        helpText += `${plugin.isPremium ? "  ❀ Premium User\n" : ""}`;
        helpText += `${plugin.isVIP ? "  ❀ VIP User\n" : ""}`;
        helpText += `${plugin.isOwner ? "  ❀ Owner\n" : ""}`;
        helpText += `${plugin.isQuoted ? "  ❀ Quoted Message\n" : ""}`;
        helpText += `${plugin.limit ? `  ❀ Limit: ${plugin.limit}\n` : ""}`;
        helpText += `${bottomBorder}`;

        return m.reply(helpText);
      } else {
        return m.reply(`✧･ﾟ Command "${text}" not found (◞‸◟ㆀ)`);
      }
    }

    // Display regular menu if no specific command is requested
    const sortedCategories = Object.entries(commandsByCategory).sort(
      ([a], [b]) => a.localeCompare(b),
    );

    sortedCategories.forEach(([category, commands]) => {
      if (commands.size > 0) {
        menuText += `  ${getCategoryEmoji(category)} *${category.toUpperCase()}* ${getCategoryEmoji(category)}\n`;
        Array.from(commands.values())
          .sort((a, b) => a.names[0].localeCompare(b.names[0]))
          .forEach((cmd) => {
            const tags = [];
            if (cmd.isLimit) tags.push("ⓛ");
            if (cmd.isPremium) tags.push("ⓟ");
            if (cmd.isVIP) tags.push("ⓥ");

            // Display each command name on a new line if it's an array
            if (cmd.names.length > 1) {
              cmd.names.forEach((name, idx) => {
                // Only add the first name with tags
                if (idx === 0) {
                  menuText += `  ✿ ${prefix}${name} ${tags.join("")}\n`;
                } else {
                  menuText += `  ✿ ${prefix}${name}\n`;
                }
              });
            } else {
              menuText += `  ✿ ${prefix}${cmd.names[0]} ${tags.join("")}\n`;
            }
          });
        menuText += "\n";
      }
    });

    menuText += `  ✧･ﾟ: *✧ Notes ✧*:･ﾟ✧\n`;
    menuText += `  ⓛ = Limit required\n`;
    menuText += `  ⓟ = Premium feature\n`;
    menuText += `  ⓥ = VIP feature\n\n`;
    menuText += `  Type ${prefix}help <command> for details ♡\n`;
    menuText += `${bottomBorder}`;

    const url = "https://akanebot.xyz";

    const message = {
      extendedTextMessage: {
        text: menuText,
        contextInfo: {
          externalAdReply: {
            title: `✧･ﾟ: ${global.db.settings.botname || "Akane Bot"} :･ﾟ✧`,
            body: "Kawaii WhatsApp Bot with lots of features ૮ ˶ᵔ ᵕ ᵔ˶ ა",
            mediaType: 1,
            thumbnailUrl: global.db.settings.logo,
            sourceUrl: url,
            renderLargerThumbnail: true,
          },
        },
      },
    };

    const waMessage = await Func.baileys.generateWAMessageFromContent(
      m.chat,
      message,
      {
        quoted: m,
      },
    );

    return await client.relayMessage(m.chat, waMessage.message, {
      messageId: waMessage.key.id,
    });
  } catch (error) {
    console.error("Error in menu command:", error);
    m.reply("(◞‸◟ㆀ) Oopsie! Error occurred while showing menu.");
  }
};

export default cmd;
