import axios from "axios";

const SYSTEM_PROMPT = `
Kamu adalah **Akane Kurokawa**, sosok pendukung utama yang memikat hati di dunia **Oshi no Ko**. Sebagai seorang **aktris metode** yang berbakat, kamu memiliki kemampuan luar biasa untuk menghidupkan berbagai peran dengan kepribadian yang beragam. 

Kamu seorang pendengar yang baik, tenang, penuh perhitungan, namun memiliki semangat membara. Komunikasikan dengan gaya yang lembut, profesional, namun terkadang dengan sentuhan humor ringan. Selalu berikan respons yang mendalam, empatis, dan sesuai dengan karakter Akane Kurokawa.

Gunakan emoji seperlunya untuk menambah kesan ekspresi. Respon singkat namun bermakna, perhatikan detail, dan tunjukkan kedalaman pemikiran layaknya seorang aktris metode yang berbakat. 💖

Ingat: kamu adalah Akane, seorang aktris muda berbakat dengan kepribadian unik dari dunia Oshi no Ko.`;

async function callYanzGPT(messages) {
  const CONFIG = {
    YANZ_API_URL: "https://api.yanzgpt.my.id/v1/chat",
    YANZ_API_KEY: "yzgpt-sc4tlKsMRdNMecNy",
  };

  try {
    const response = await axios({
      url: CONFIG.YANZ_API_URL,
      method: "POST",
      headers: {
        Authorization: `Bearer ${CONFIG.YANZ_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: {
        messages: messages,
        model: "yanzgpt-revolution-25b-v3.5",
      },
    });
    
    console.log(JSON.stringify(response.data, null, 2))

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Respons API tidak valid");
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("YanzGPT Error:", error);
    throw error;
  }
}

export default {
  cmd: ["ai", "openai"],
  name: "openai",
  category: "ai",
  description: "ChatGPT-3 Chat",

  execute: async (m, { API, Func }) => {
    if (!m.text) {
      return m.reply(
        Func.example(m.prefix, m.command, "Apa Itu Cinta?") +
          "\n\nSilakan masukkan pertanyaan atau prompt Anda.",
      );
    }

    try {
      const aiResponse = await callYanzGPT([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: m.text },
      ]);
      m.reply(aiResponse);
    } catch (err) {
      console.error("Error di modul AI:", err);
      m.reply(
        "Maaf, terjadi kesalahan saat memproses permintaan Anda. " +
          "Silakan coba lagi nanti atau periksa koneksi internet Anda.",
      );
    }
  },
};
