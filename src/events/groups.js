import baileys from "@whiskeysockets/baileys";
const { jidNormalizedUser } = baileys;
export default (client, store) => {
  
  // Participants update handler
  client.ev.on("group-participants.update", ({ id, participants, action }) => {
    const metadata = store.groupMetadata[id];
    if (metadata) {
      switch (action) {
        case "add":
          metadata.participants.push(
            ...participants.map((id) => ({
              id: jidNormalizedUser(id),
              admin: null,
            })),
          );
          break;
        case "remove":
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
    }
  });
};
