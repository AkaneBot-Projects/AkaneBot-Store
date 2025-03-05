export default {
  cmd: ["ytmp3", "ytmp4"],
  name: ["ytmp3", "ytmp4"],
  category: "downloader",
  description: "Download video/audio dari YouTube dengan pilihan format",
  execute: async (m, { client, Func }) => {
    if (!m.text) {
      return m.reply(
        Func.example(
          m.prefix,
          m.command,
          "https://youtube.com/watch?v=KXQehM6GzYI",
        ),
      );
    }

    if (!Func.isUrl(m.text)) {
      return m.reply("[!] Silakan masukkan URL YouTube yang valid.");
    }

    await m.react("🕒");

    try {
      // Convert request body to URL parameters
      const params = new URLSearchParams({
        url: m.text,
        type: m.command === "ytmp3" ? "audio" : "video",
        quality: m.command === "ytmp3" ? "128" : "480",
      });

      const response = await fetch(
        `https://api.arifzyn.site/download/youtube?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!data.status === 200 || !data.result) {
        throw new Error("Gagal mendapatkan informasi video.");
      }

      const downloadUrl = data.result.url;
      const title = data.result.title;

      const fileResponse = await fetch(downloadUrl);
      const fileBuffer = await fileResponse.arrayBuffer();

      const isAudio = m.command === "ytmp3";
      const extension = isAudio ? "mp3" : "mp4";
      const filename = `${title}.${extension}`;

      await client.sendMedia(
        m.chat,
        Buffer.from(fileBuffer),
        m,
        {
          mimetype: isAudio ? "audio/mpeg" : "video/mp4",
          fileName: filename,
        },
        { quoted: m },
      );
    } catch (error) {
      console.error("Error:", error);
      m.reply("Terjadi kesalahan saat mengunduh. Silakan coba lagi nanti.");
    }
  },
};
