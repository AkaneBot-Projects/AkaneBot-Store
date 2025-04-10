export default {
  cmd: ["groupinfo", "gcinfo"],
  name: "groupinfo",
  category: "group",
  description: "Get detailed group information",
  isGroup: true,
  execute: async (m, { client }) => {
    try {
      let meta = await client.groupMetadata(m.chat);
      let info = `*GROUP INFO*\n\n`;
      info += `Name: ${meta.subject}\n`;
      info += `Members: ${meta.participants.length}\n`;
      info += `Admins: ${meta.participants.filter((p) => p.admin).length}\n`;
      info += `Created: ${new Date(meta.creation * 1000).toDateString()}\n`;
      info += `Owner: @${meta.owner.split("@")[0]}\n`;
      info += `Description:\n${meta.desc || "No description"}`;

      m.reply(info, { mentions: [meta.owner] });
    } catch {
      m.reply("Failed to get group info");
    }
  },
};
