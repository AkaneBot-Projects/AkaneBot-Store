const handler = async (m, { conn, args, text, command }) => {
  try {
    let type = args[0]?.toLowerCase();
    let value = args.slice(1).join(" ");

    if (!type) {
      let settings = global.db.settings;
      let settingsList = Object.entries(settings)
        .map(([key, val]) => {
          return `◦ ${key}: ${
            typeof val === "boolean"
              ? val
                ? "✅"
                : "❌"
              : typeof val === "object"
                ? "📑 [Object]"
                : val
          }`;
        })
        .join("\n");

      return m.reply(`*Current Settings:*\n\n${settingsList}\n\n*Usage:*
◦ View setting: ${m.prefix + command} <type>
◦ Change setting: ${m.prefix + command} <type> <value>

*Example:*
◦ ${m.prefix + command} firstchat true
◦ ${m.prefix + command} limit.free 15`);
    }

    if (!value) {
      let setting = type
        .split(".")
        .reduce((obj, key) => obj?.[key], global.db.settings);
      if (setting === undefined)
        return m.reply(`❌ Setting '${type}' not found!`);

      return m.reply(
        `*${type}*: ${
          typeof setting === "object"
            ? JSON.stringify(setting, null, 2)
            : setting
        }`,
      );
    }

    let keys = type.split(".");
    let lastKey = keys.pop();
    let settingObj = keys.reduce((obj, key) => obj[key], global.db.settings);

    if (settingObj === undefined) {
      return m.reply(`❌ Invalid setting path: ${type}`);
    }

    switch (typeof settingObj[lastKey]) {
      case "boolean":
        if (!["true", "false"].includes(value.toLowerCase())) {
          return m.reply(`❌ Value must be 'true' or 'false'`);
        }
        settingObj[lastKey] = value.toLowerCase() === "true";
        break;

      case "number":
        if (isNaN(value)) {
          return m.reply(`❌ Value must be a number`);
        }
        settingObj[lastKey] = Number(value);
        break;

      case "object":
        try {
          let newValue = JSON.parse(value);
          settingObj[lastKey] = newValue;
        } catch {
          return m.reply(`❌ Invalid JSON format`);
        }
        break;

      default:
        settingObj[lastKey] = value;
    }

    await m.reply(`✅ Successfully updated setting
◦ Type: ${type}
◦ New Value: ${
      typeof settingObj[lastKey] === "object"
        ? JSON.stringify(settingObj[lastKey], null, 2)
        : settingObj[lastKey]
    }`);
  } catch (error) {
    console.error("Settings Error:", error);
    await m.reply("❌ Error occurred while updating settings.");
  }
};

export default {
  cmd: ["setting", "settings", "set"],
  name: "settings",
  category: ["owner"],
  description: "View or change bot settings",
  isOwner: true,
  execute: handler,
};
