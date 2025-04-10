/**
 * ✨🌸 Kawaii Shop Store Plugin for WhatsApp Bot 🌸✨
 * Handles shop store listings with cute formatting and image support
 */
 
import moment from 'moment-timezone'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  addResponList, 
  delResponList, 
  isAlreadyResponList, 
  isAlreadyResponListGroup, 
  sendResponList, 
  updateResponList, 
  getDataResponList 
} from "../../src/lib/liststore.js";

// Initialize database
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: ["addlist", "dellist", "updatelist", "list", "proses", "done"],
    cmd: ["addlist", "dellist", "updatelist", "list", "proses", "done"],
    category: "store",
    isOwner: false,
    isGroup: true,
    
    before: async function(m) {
      if (!m.isGroup || m.isCommand) return false;
      
      const db_store = global.db.bots.store
      const listData = getDataResponList(m.chat, m.body, db_store);
       
      if (listData) {
        let statusBadge = "";
        if (listData.status === "processing") {
          statusBadge = "⏳ *[SEDANG DIPROSES]* ⏳";
        } else if (listData.status === "done") {
          statusBadge = "✅ *[SELESAI]* ✅";
        }
        
        const replyText = `${listData.response}
  
  ᵗʰᵃⁿᵏ ʸᵒᵘ ᶠᵒʳ ˢʰᵒᵖᵖⁱⁿᵍ ᵏᵉᵉᵖ ˢᵐⁱˡⁱⁿᵍ!`.trim();
  
        if (listData.isImage && listData.image_url !== '-') {
          await m.reply(listData.image_url, { caption: replyText });
        } else {
          await m.reply(replyText);
        }
        
        return true;
      }
      
      return false;
    },
    
    execute: async function(m, { args, command, text, client, Func }) {
      const db_store = global.db.bots.store
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
          
          if (isAlreadyResponList(groupId, key.trim(), db_store)) {
            return m.reply(`❀ *Oopsie!* ❀\n\n❥ List dengan key "${key.trim()}" sudah ada!\n❥ Gunakan /updatelist untuk mengubah`);
          }
          
          // If there's an attached media, upload it
          let imageUrl = '-';
          if (hasMedia) {
            m.reply(`❥ Uploading image... please wait! ⋆｡°✩`);
            
            try {
              let media = await q.download();
              let { data } = await Func.upload.arcdn(media);
              imageUrl = data.url;
            } catch (error) {
              return m.reply(`❥ Failed to upload image: ${error.message}`);
            }
          }
          
          // Add to database
          addResponList(groupId, key.trim(), content.trim(), hasMedia, imageUrl, db_store);
          
          let successMsg = `❀ *Yay! Success* ❀\n\n❥ Item baru ditambahkan!\n❥ Key: ${key.trim()} ✓`;
          if (hasMedia) {
            successMsg += `\n❥ With Image: ✓`;
          }
      
          m.reply(successMsg);
          break;
          
        case "dellist":
          if (!m.isAdmin) return m.reply("admin")
          if (!args[0]) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /dellist key");
          }
          
          const keyToDelete = args[0];
          
          if (!isAlreadyResponList(groupId, keyToDelete, db_store)) {
            return m.reply(`❀ *Not Found* ❀\n\n❥ List dengan key "${args[0]}" tidak ditemukan`);
          }
          
          delResponList(groupId, keyToDelete, db_store);
          
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
          
          const existingItem = getDataResponList(groupId, keyToUpdate.trim(), db_store);
          
          if (!existingItem) {
            return m.reply(`❀ *Not Found* ❀\n\n❥ List dengan key "${keyToUpdate.trim()}" tidak ditemukan`);
          }
          
          // If there's an attached media, upload it
          let newImageUrl = existingItem.image_url;
          if (hasMedia) {
            m.reply(`❀ *Processing* ❀\n\n❥ Uploading image... please wait! ⋆｡°✩`);
            
            try {
              let media = await q.download();
              let { data } = await Func.upload.arcdn(media);
              newImageUrl = data.url;
            } catch (error) {
              return m.reply(`❀ *Upload Error* ❀\n\n❥ Failed to upload image: ${error.message}`);
            }
          }
          
          // Update the item
          updateResponList(groupId, keyToUpdate.trim(), newContent.trim(), hasMedia || existingItem.isImage, newImageUrl, db_store);
          
          let updateMsg = `❀ *Updated!* ❀\n\n❥ Item dengan key: ${keyToUpdate.trim()} berhasil diperbarui`;
          if (hasMedia) {
            updateMsg += `\n❥ Image juga diperbarui ✓`;
          }
          
          m.reply(updateMsg);
          break;
          
        case "proses":
          if (!m.isAdmin) return m.reply("admin")
          if (!args[0]) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /proses key (alasan opsional)");
          }
          
          const keyToProcess = args[0];
          const existingProcessItem = getDataResponList(groupId, keyToProcess, db_store);
          
          if (!existingProcessItem) {
            return m.reply(`❀ *Not Found* ❀\n\n❥ List dengan key "${args[0]}" tidak ditemukan`);
          }
          
          // Get reason if provided (everything after the key)
          const processReason = args.slice(1).join(" ") || "Pesanan sedang diproses";
          
          // Update the item
          updateResponList(
            groupId, 
            keyToProcess, 
            existingProcessItem.response, 
            existingProcessItem.isImage, 
            existingProcessItem.image_url, 
            db_store,
            "processing"  // Add status as parameter to updateResponList
          );
          
          // Create a message to send to the group
          const userName = m.pushName || "Admin"; // Use pushName if available
          
          let processingMessage = `
⏳ *STATUS DIUBAH KE PROSES* ⏳

╭── ♡ ⋆｡°✩ ──╮
 *Order:* ${keyToProcess}
 *Status:* Sedang Diproses
 *Note:* ${processReason}
 *Oleh:* ${userName}
╰── ♡ ⋆｡°✩ ──╯`;

          // If the item has an image, send with the image
          if (existingProcessItem.isImage && existingProcessItem.image_url !== '-') {
            await m.reply({ image: { url: existingProcessItem.image_url }, caption: processingMessage });
          } else {
            await m.reply(processingMessage);
          }
          break;
          
        case "done":
          if (!m.isAdmin) return m.reply("admin")
          if (!args[0]) {
            return m.reply("❀ *Format Error* ❀\n\n❥ Format yang benar: /done key (catatan opsional)");
          }
          
          const keyToDone = args[0];
          const existingDoneItem = getDataResponList(groupId, keyToDone, db_store);
          
          if (!existingDoneItem) {
            return m.reply(`❀ *Not Found* ❀\n\n❥ List dengan key "${args[0]}" tidak ditemukan`);
          }
          
          // Get note if provided (everything after the key)
          const doneNote = args.slice(1).join(" ") || "Pesanan telah selesai";
          
          // Update the item
          updateResponList(
            groupId, 
            keyToDone, 
            existingDoneItem.response, 
            existingDoneItem.isImage, 
            existingDoneItem.image_url, 
            db_store,
            "done"  // Add status as parameter to updateResponList
          );
          
          // Create a message to send to the group
          const doneUserName = m.pushName || "Admin"; // Use pushName if available
          
          let doneMessage = `
✅ *STATUS DIUBAH KE SELESAI* ✅

╭── ♡ ⋆｡°✩ ──╮
 *Order:* ${keyToDone}
 *Status:* Selesai
 *Note:* ${doneNote}
 *Oleh:* ${doneUserName}
╰── ♡ ⋆｡°✩ ──╯

ᵀᵉʳⁱᵐᵃᵏᵃˢⁱʰ ᵗᵉˡᵃʰ ᵇᵉʳᵇᵉˡᵃⁿʲᵃ! ˢⁱˡᵃʰᵏᵃⁿ ᵈᵃᵗᵃⁿᵍ ᵏᵉᵐᵇᵃˡⁱ ❤️`;

          // If the item has an image, send with the image
          if (existingDoneItem.isImage && existingDoneItem.image_url !== '-') {
            await m.reply({ image: { url: existingDoneItem.image_url }, caption: doneMessage });
          } else {
            await m.reply(doneMessage);
          }
          break;
          
        case "list":
          // Get all items for this group
          const groupItems = db_store.filter(item => item.id === groupId);
          
          if (groupItems.length === 0) {
            return m.reply("❀ *Empty Shop* ❀\n\n❥ Belum ada item yang tersimpan di toko ini (⋟﹏⋞)");
          }
          
          // Generate plain list (no categories)
          let listItemsText = "";
          
          // Sort items alphabetically
          const sortedItems = groupItems.sort((a, b) => a.key.localeCompare(b.key));
          
          // Add header
          listItemsText += `\n┌─ *DAFTAR ITEM* ─┐\n`;
          
          // Add each item
          sortedItems.forEach(item => {
            const statusIcon = item.status === "processing" ? "⏳ " : 
                             item.status === "done" ? "✅ " : "";
            listItemsText += `│ ✿ ${statusIcon}${item.key}\n`;
          });
          
          listItemsText += `└───────────────┘\n`;
          
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
${listItemsText}   

${global.db.settings.botname || "AkaneShop"}
`;
          
          m.reply(listText.trim(), {
            mentions: [m.sender] 
          });
          break;
      }
    }
  };