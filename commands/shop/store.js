/**
 * ✨🌸 Kawaii Shop Store Plugin for WhatsApp Bot 🌸✨
 * Handles shop store listings with cute formatting, image support, and order status
 */
 
import moment from 'moment-timezone'; 

export default {
    name: ["addlist", "dellist", "updatelist", "list", "proses", "done"],
    cmd: ["addlist", "dellist", "updatelist", "list", "proses", "done"],
    category: "store",
    isOwner: false,
    isGroup: true,
    
    before: async function(m) {
      if (!m.isGroup || m.isCommand) return false;
      
      if (!global.db.bots.store) {
        global.db.bots.store = [];
      }
      
      const storeItems = global.db.bots.store.filter(item => item.groupId === m.chat);
      const matchedItem = storeItems.find(item => item.key.toLowerCase() === m.body.toLowerCase());
      
      if (matchedItem) {
        let statusBadge = "";
        if (matchedItem.status === "processing") {
          statusBadge = "⏳ *[SEDANG DIPROSES]* ⏳";
        } else if (matchedItem.status === "done") {
          statusBadge = "✅ *[SELESAI]* ✅";
        }
        
        const createdAtFormatted = moment(matchedItem.createdAt)
        .tz("Asia/Jakarta")
        .format("dddd, YYYY-MM-DD"); 
    
        let replyText = `${matchedItem.content}
  
  ᵗʰᵃⁿᵏ ʸᵒᵘ ᶠᵒʳ ˢʰᵒᵖᵖⁱⁿᵍ ᵏᵉᵉᵖ ˢᵐⁱˡⁱⁿᵍ!`.trim();
        
        // If there's an image, send it with the caption
        if (matchedItem.imageUrl) {
          await m.reply(matchedItem.imageUrl, { caption: replyText });
        } else {
          await m.reply(replyText);
        }
        
        return true;
      }
      
      return false;
    },
    
    execute: async function(m, { args, command, text, client, Func }) {
      if (!global.db.bots.store) {
        global.db.bots.store = [];
      }
      
      const q = m.quoted ? m.quoted : m;
      const groupId = m.chat;
      const hasMedia = q.type?.includes('image') || q.type?.includes('video');
     
      switch (command) {
        case "addlist":
          if (!m.isAdmin) return m.reply("admin")
          if (!text.includes("@")) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /addlist key@content\n❥ Untuk menambah gambar, reply ke gambar");
          }
          
          const [key, content] = text.split("@");
          
          if (!key || !content) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /addlist key@content\n❥ Untuk menambah gambar, reply ke gambar");
          }
          
          const existingItem = global.db.bots.store.find(
            item => item.groupId === groupId && item.key.toLowerCase() === key.toLowerCase()
          );
          
          if (existingItem) {
            return m.reply(`❀ *Oopsie!* ❀\n\n❥ List dengan key "${key}" sudah ada!\n❥ Gunakan /updatelist untuk mengubah`);
          }
          
          // Initialize item data
          const newItem = {
            groupId,
            key: key.trim(),
            content: content.trim(),
            createdBy: m.sender,
            createdAt: new Date().toISOString()
          };
          
          // If there's an attached media, upload it
          if (hasMedia) {
            m.reply(`❥ Uploading image... please wait! ⋆｡°✩`);
            
            try {
              let media = await q.download();
              let { data } = await Func.upload.arcdn(media);
              newItem.imageUrl = data.url;
            } catch (error) {
              return m.reply(`❥ Failed to upload image: ${error.message}`);
            }
          }
          
          global.db.bots.store.push(newItem);
          
          let successMsg = `❀ *Yay! Success* ❀\n\n❥ Item baru ditambahkan!\n❥ Key: ${key} ✓`;
          if (newItem.imageUrl) {
            successMsg += `\n❥ With Image: ✓`;
          }
      
          m.reply(successMsg);
          break;
          
        case "dellist":
          if (!m.isAdmin) return m.reply("admin")
          if (!args[0]) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /dellist key");
          }
          
          const keyToDelete = args[0].toLowerCase();
          const initialLength = global.db.bots.store.length;
          
          global.db.bots.store = global.db.bots.store.filter(
            item => !(item.groupId === groupId && item.key.toLowerCase() === keyToDelete)
          );
          
          if (global.db.bots.store.length === initialLength) {
            return m.reply(`❀ *Not Found* ❀\n\n❥ List dengan key "${args[0]}" tidak ditemukan`);
          }
          
          m.reply(`❀ *Deleted!* ❀\n\n❥ Item dengan key: ${args[0]} berhasil dihapus`);
          break;
          
        case "updatelist":
          if (!m.isAdmin) return m.reply("admin")
          if (!text.includes("@")) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /updatelist key@newcontent\n❥ Untuk menambah/update gambar, reply ke gambar");
          }
          
          const [keyToUpdate, newContent] = text.split("@");
          
          if (!keyToUpdate || !newContent) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /updatelist key@newcontent\n❥ Untuk menambah/update gambar, reply ke gambar");
          }
          
          const itemIndex = global.db.bots.store.findIndex(
            item => item.groupId === groupId && item.key.toLowerCase() === keyToUpdate.toLowerCase()
          );
          
          if (itemIndex === -1) {
            return m.reply(`❀ *Not Found* ❀\n\n❥ List dengan key "${keyToUpdate}" tidak ditemukan`);
          }
          
          global.db.bots.store[itemIndex].content = newContent.trim();
          global.db.bots.store[itemIndex].updatedBy = m.sender;
          global.db.bots.store[itemIndex].updatedAt = new Date().toISOString();
          
          // If there's an attached media, upload it
          if (hasMedia) {
            m.reply(`❀ *Processing* ❀\n\n❥ Uploading image... please wait! ⋆｡°✩`);
            
            try {
              let media = await q.download();
              let { data } = await Func.upload.arcdn(media);
              global.db.bots.store[itemIndex].imageUrl = data.url;
            } catch (error) {
              return m.reply(`❀ *Upload Error* ❀\n\n❥ Failed to upload image: ${error.message}`);
            }
          }
          
          let updateMsg = `❀ *Updated!* ❀\n\n❥ Item dengan key: ${keyToUpdate} berhasil diperbarui`;
          if (hasMedia) {
            updateMsg += `\n❥ Image juga diperbarui ✓`;
          }
          updateMsg += ``;
          
          m.reply(updateMsg);
          break;
          
        case "proses":
          if (!m.isAdmin) return m.reply("admin")
          if (!args[0]) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /proses key (alasan opsional)");
          }
          
          const keyToProcess = args[0].toLowerCase();
          const processIndex = global.db.bots.store.findIndex(
            item => item.groupId === groupId && item.key.toLowerCase() === keyToProcess
          );
          
          if (processIndex === -1) {
            return m.reply(`❀ *Not Found* ❀\n\n❥ List dengan key "${args[0]}" tidak ditemukan`);
          }
          
          // Get reason if provided (everything after the key)
          const processReason = args.slice(1).join(" ") || "Pesanan sedang diproses";
          
          // Update status
          global.db.bots.store[processIndex].status = "processing";
          global.db.bots.store[processIndex].statusReason = processReason;
          global.db.bots.store[processIndex].statusBy = m.sender;
          global.db.bots.store[processIndex].statusAt = new Date().toISOString();
          
          // Create a message to send to the group
          const item = global.db.bots.store[processIndex];
          const userName = m.pushName || "Admin"; // Use pushName if available
          
          let processingMessage = `
  ⏳ *STATUS DIUBAH KE PROSES* ⏳
  
  ╭── ♡ ⋆｡°✩ ──╮
   *Order:* ${item.key}
   *Status:* Sedang Diproses
   *Note:* ${processReason}
   *Oleh:* ${userName}
  ╰── ♡ ⋆｡°✩ ──╯`;
  
          // If the item has an image, send with the image
          if (item.imageUrl) {
            await m.reply({ image: { url: item.imageUrl }, caption: processingMessage });
          } else {
            await m.reply(processingMessage);
          }
          break;
          
        case "done":
          if (!m.isAdmin) return m.reply("admin")
          if (!args[0]) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /done key (catatan opsional)");
          }
          
          const keyToDone = args[0].toLowerCase();
          const doneIndex = global.db.bots.store.findIndex(
            item => item.groupId === groupId && item.key.toLowerCase() === keyToDone
          );
          
          if (doneIndex === -1) {
            return m.reply(`❀ *Not Found* ❀\n\n❥ List dengan key "${args[0]}" tidak ditemukan`);
          }
          
          // Get note if provided (everything after the key)
          const doneNote = args.slice(1).join(" ") || "Pesanan telah selesai";
          
          // Update status
          global.db.bots.store[doneIndex].status = "done";
          global.db.bots.store[doneIndex].statusReason = doneNote;
          global.db.bots.store[doneIndex].statusBy = m.sender;
          global.db.bots.store[doneIndex].statusAt = new Date().toISOString();
          
          // Create a message to send to the group
          const doneItem = global.db.bots.store[doneIndex];
          const doneUserName = m.pushName || "Admin"; // Use pushName if available
          
          let doneMessage = `
  ✅ *STATUS DIUBAH KE SELESAI* ✅
  
  ╭── ♡ ⋆｡°✩ ──╮
   *Order:* ${doneItem.key}
   *Status:* Selesai
   *Note:* ${doneNote}
   *Oleh:* ${doneUserName}
  ╰── ♡ ⋆｡°✩ ──╯
  
  ᵀᵉʳⁱᵐᵃᵏᵃˢⁱʰ ᵗᵉˡᵃʰ ᵇᵉʳᵇᵉˡᵃⁿʲᵃ! ˢⁱˡᵃʰᵏᵃⁿ ᵈᵃᵗᵃⁿᵍ ᵏᵉᵐᵇᵃˡⁱ ❤️`;
  
          // If the item has an image, send with the image
          if (doneItem.imageUrl) {
            await m.reply({ image: { url: doneItem.imageUrl }, caption: doneMessage });
          } else {
            await m.reply(doneMessage);
          }
          break;
          
        case "list":
          const groupItems = global.db.bots.store.filter(item => item.groupId === groupId);
          
          if (groupItems.length === 0) {
            return m.reply("❀ *Empty Shop* ❀\n\n❥ Belum ada item yang tersimpan di toko ini (⋟﹏⋞)");
          }
          
          const listItems = groupItems
  .sort((a, b) => a.key.localeCompare(b.key)) // Urutkan berdasarkan key secara alfabetis
  .map((item) => {
    const statusIcon = item.status === "processing" ? "⏳ " : 
                       item.status === "done" ? "✅ " : "";
    return `   ✿ ${statusIcon}${item.key}`;
  })
  .join("\n");
  
          const shopName = await client.getName(groupId);
          
moment.locale("id"); 

const currentDate = moment().tz("Asia/Jakarta").format("dddd, DD MMMM YYYY");
const user = m.sender.split("@")[0]; 

const listText = `
╭・・┈┈┈┈┈┈ ♡ ┈┈┈┈┈┈・・╮
   *✧･ﾟ ${shopName} ･ﾟ✧*
╰・・┈┈┈┈┈┈ ♡ ┈┈┈┈┈┈・・╯
  
📅 *Tanggal:* ${currentDate}
halo ka @${user}
ini list yang ada di grup ini

✧･ﾟ: *✧ CATALOG ✧*:･ﾟ✧
${listItems}   

${global.db.settings.botname || "AkaneShop"}
`;
          
          m.reply(listText.trim(), {
          	mentions: [m.sender] 
          });
          break;
      }
    }
  };