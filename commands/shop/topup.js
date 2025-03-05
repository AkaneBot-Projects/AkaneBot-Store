import TopupInyukAPI from "../../src/scraper/topupinyuk.js";

const API_KEY = process.env.TOPUPINYUK_API_KEY || 'API4JQRDD1720650075999';
const topupinyuk = new TopupInyukAPI(API_KEY);

export default {
  cmd: ["topup", "ceksaldo", "cekservice", "service", "status"],
  name: ["topup", "ceksaldo", "cekservice", "service", "status"],
  tags: ["shop"],
  description: "Perintah untuk berinteraksi dengan TopupInyuk API",
  
  isOwner: true, 
  
  execute: async function (m, { 
    client, 
    command, 
    prefix, 
    args, 
    text, 
    quoted, 
    options 
  }) {
    try {
      switch (command) {
        case 'topup':
          // Contoh perintah topup
          // Format: !topup <service_id> <target> <kontak>
          if (args.length < 3) {
            return m.reply(`Penggunaan: ${prefix}topup <service_id> <target> <kontak>
Contoh: ${prefix}topup ML86 983232342|9923 08151769999`);
          }

          const [service_id, target, kontak] = args;
          const orderResponse = await topupinyuk.createOrder({
            service_id,
            target,
            kontak,
            idtrx: `ORDER${Date.now()}`
          });

          m.reply(`✅ Pesanan berhasil dibuat!
ID Pesanan: ${orderResponse.data.id}
Layanan: ${orderResponse.data.service_name}
Status: ${orderResponse.data.status}`);
          break;

        case 'ceksaldo':
          // Cek saldo TopupInyuk
          const balanceResponse = await topupinyuk.checkBalance();
          m.reply(`💰 Saldo TopupInyuk Anda: Rp ${balanceResponse.data.saldo}`);
          break;

        case 'cekservice':
          const servicesResponse = await topupinyuk.getServices();
          const uniqueCategories = [...new Set(servicesResponse.data.map(service => service.kategori))];
          
          let categoriesMessage = '📋 Kategori Layanan TopupInyuk:\n\n';
          
          uniqueCategories.forEach((category, index) => {
            categoriesMessage += `${index + 1}. ${category}\n`;
          });
          
          m.reply(categoriesMessage);
          
          m.reply(`💡 Gunakan perintah !service <kategori> untuk melihat detail layanan.
Contoh: !service "Mobile Legends"`);
          break;
          
        case 'service':
          // Tampilkan service berdasarkan kategori
          if (!args[0]) {
            return m.reply(`Penggunaan: ${prefix}service <kategori>
Contoh: ${prefix}service "Mobile Legends"`);
          }

          const serviceCategory = args.join(' ');
          const allServicesResponse = await topupinyuk.getServices();
          
          // Filter services berdasarkan kategori
          const filteredServices = allServicesResponse.data.filter(
            service => service.kategori.toLowerCase() === serviceCategory.toLowerCase()
          );

          if (filteredServices.length === 0) {
            return m.reply(`❌ Tidak ada layanan ditemukan untuk kategori "${serviceCategory}"`);
          }

          let categoryDetailsMessage = `📋 Layanan Kategori *${serviceCategory}*:\n\n`;
          filteredServices.forEach(service => {
            categoryDetailsMessage += `🔸 *${service.nama_layanan}*
  ID: ${service.id}
  Harga: Rp ${service.harga.toLocaleString()}
  Harga Gold: Rp ${service.harga_gold.toLocaleString()}
  Harga Silver: Rp ${service.harga_silver.toLocaleString()}
  Harga Pro: Rp ${service.harga_pro.toLocaleString()}
  Status: ${service.status}\n\n`;
          });

          m.reply(categoryDetailsMessage);
          break;
 
        case 'status':
          // Cek status pesanan
          // Format: !status <order_id>
          if (!args[0]) {
            return m.reply(`Penggunaan: ${prefix}status <order_id>
Contoh: ${prefix}status ORDER1723492316XXX`);
          }

          const statusResponse = await topupinyuk.checkOrderStatus(args[0]);
          m.reply(`📦 Status Pesanan:
ID Pesanan: ${statusResponse.data.id}
Status: ${statusResponse.data.status}
Keterangan: ${statusResponse.data.keterangan || 'Tidak ada keterangan'}`);
          break;

        default:
          m.reply('❌ Perintah tidak dikenali');
      }

    } catch (error) {
      console.error('TopupInyuk API Error:', error);
      m.reply(`❌ Terjadi kesalahan: ${error.message}`);
    }
  },

  after: async function (m) {
    console.log(`User ${m.sender} menggunakan perintah TopupInyuk: ${m.command}`);
  },
};