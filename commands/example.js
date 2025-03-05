export default {
  cmd: ["example"],
  name: ["example"],
  tags: ["utility"],
  description: "Contoh perintah dengan before, after, options, dan execute.",
  
    isPremium: false, // Hanya bisa digunakan oleh premium (false berarti semua bisa)
    isOwner: false, // Hanya bisa digunakan oleh owner
    isGroup: false, // Harus di dalam grup
    isBotAdmin: false, // Bot harus admin
    isAdmin: false, // User harus admin grup
    isPrivate: false, // Hanya bisa di chat pribadi
    isQuoted: false, // Harus membalas pesan
    limit: 2, // Jumlah limit yang dikurangi saat command dipakai
    exp: 10, // Experience yang diberikan setelah command dipakai
  
  before: async function (m, { client,
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
              groupSettings  }) {
    
    return false; // Lanjut ke `execute`
  },

  execute: async function (m, { client, options }) {
    // Cek apakah perintah memerlukan limit dan apakah user memiliki cukup limit
    if (options.limit && !m.isOwner) {
      if (global.db.users[m.sender].limit < options.limit) {
        return m.reply(
          `Limit tidak cukup! Dibutuhkan: ${options.limit}, Sisa: ${global.db.users[m.sender].limit}`,
        );
      }
      global.db.users[m.sender].limit -= options.limit;
    }

    // Eksekusi utama perintah
    m.reply("✅ Perintah berhasil dijalankan!");

    // Beri EXP jika ada dalam options
    if (options.exp && !m.isOwner) {
      global.db.users[m.sender].exp += options.exp;
    }
  },

  after: async function (m) {
    console.log(`User ${m.sender} menggunakan perintah example`);
  },
};