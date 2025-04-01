import baileys from "@whiskeysockets/baileys";
import { drawCard, LinearGradient } from "discord-welcome-card";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const { jidNormalizedUser } = baileys;

const bg_img = "https://raw.githubusercontent.com/Arifzyn19/Arifzyn19/refs/heads/main/media/313f0f3be163dff8128e0272663a08e8.jpg";

const getProfilePic = async (jid, client) => {
  try {
    const pp = await client.profilePictureUrl(jid, "image");
    return pp;
  } catch {
    return "https://raw.githubusercontent.com/Arifzyn19/Arifzyn19/refs/heads/main/media/IMG-20240911-WA0031.png";
  }
};

const createWelcomeCard = async (member, groupName) => {
  const cardOptions = {
    theme: "dark",
    text: {
      title: "Welcome",
      text: member.username,
      subtitle: `to ${groupName}`,
      color: new LinearGradient([0, "#0D120E"], [1, "#a8a8a8"]), // Gradient text for dramatic effect
    },
    avatar: {
      image: member.avatar,
      outlineWidth: 4,
      outlineColor: new LinearGradient([0, "#2d2d2d"], [1, "#555555"]), // Dark gradient outline
      borderRadius: 0.8,
      imageRadius: 0.7,
    },
    card: {
      background: bg_img,
      blur: 2,
      border: true,
      rounded: true,
    },
  };

  const image = await drawCard(cardOptions);
  return image;
};

const createLeaveCard = async (member, groupName) => {
  const cardOptions = {
    theme: "dark",
    text: {
      title: "Goodbye",
      text: member.username,
      subtitle: `We'll miss you`,
      color: new LinearGradient([0, "#0D120E"], [1, "#a8a8a8"]), // Matching gradient text
    },
    avatar: {
      image: member.avatar,
      outlineWidth: 4,
      outlineColor: new LinearGradient([0, "#2d2d2d"], [1, "#555555"]), // Dark gradient outline
      borderRadius: 0.8,
      imageRadius: 0.7,
    },
    card: {
      background: bg_img,
      blur: 2,
      border: true,
      rounded: true,
    },
  };

  const image = await drawCard(cardOptions);
  return image;
};

export { createWelcomeCard, createLeaveCard };
export default (client, store) => {
  client.ev.on(
    "group-participants.update",
    async ({ id, participants, action }) => {
      const metadata = await client.groupMetadata(id);
      if (!metadata) return;

      const groupSettings = global.db.groups[id] || {};
      if (!groupSettings.welcome && action === "add") return;
      if (!groupSettings.leave && action === "remove") return;

      try {
        switch (action) {
          case "add":
            for (const participantId of participants) {
              const userName = await client.getName(participantId);
              const userPp = await getProfilePic(participantId, client);
              
              const welcomeCard = await createWelcomeCard(
                {
                  username: userName,
                  avatar: userPp,
                },
                metadata.subject,
              );
              
              await client.sendMessage(id, {
                image: welcomeCard,
                caption: `🌷 いらっしゃいませ 𝑰𝒓𝒂𝒔𝒔𝒉𝒂𝒊𝒎𝒂𝒔𝒆 (⁠｡⁠◕⁠‿⁠◕⁠｡⁠) 
*@${participantId.split("@")[0]}* 🎉

⌗ ┆ketik .list untuk melihat list
⌗ ┆grup mabar dan topup
⌗ ┆dilarang chat/kirim stiker 18+ 
⌗ ┆ada pertanyaan? silahkan tag/pc admin

≿━━━━༺❀༻━━━━༺❀༻━━━━≾`,
                mentions: [participantId],
              });
            }

            metadata.participants.push(
              ...participants.map((id) => ({
                id: jidNormalizedUser(id),
                admin: null,
              })),
            );
            break;

          case "remove":
            for (const participantId of participants) {
              const userName = await client.getName(participantId);
              const userPp = await getProfilePic(participantId, client);
              
              const leaveCard = await createLeaveCard(
                {
                  username: userName,
                  avatar: userPp,
                },
                metadata.subject,
              );
              
              await client.sendMessage(id, {
                image: leaveCard,
                caption:
                  `*Goodbye @${participantId.split("@")[0]}* 👋\n\n` +
                  `We hope to see you again soon!\n` +
                  `Take care! ✨`,
                mentions: [participantId],
              });
            }

            metadata.participants = metadata.participants.filter(
              (p) => !participants.includes(jidNormalizedUser(p.id)),
            );
            break;

          case "promote":
          case "demote":
            for (const participant of metadata.participants) {
              let normalizedId = jidNormalizedUser(participant.id);
              if (participants.includes(normalizedId)) {
                participant.admin = action === "promote" ? "admin" : null;
              }
            }
            break;
        }
      } catch (error) {
        console.error("Error in group-participants handler:", error);
      }
    },
  );
};
