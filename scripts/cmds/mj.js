const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApi = "https://azadx69x-all-apis-top.vercel.app/api/mj";

module.exports = {
  config: {
    name: "mj",
    aliases: ["midjourney"],
    version: "0.0.9",
    role: 0,
    author: "Azadx69x",
    category: "ai",
    cooldowns: 5,
    guide: { en: "Generate midjourney image using a prompt" }
  },

  onStart: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) 
      return api.sendMessage("⚠️ Please provide a prompt.", threadID, messageID);

    try {
      api.setMessageReaction("🎨", messageID, () => {}, true);

      fs.ensureDirSync(path.join(__dirname, "cache"));
      
      const apiUrl = `${baseApi}?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);
      const result = response.data;

      if (!result.success || !result.data?.images?.length)
        throw new Error("API did not return any images.");
      
      const attachments = [];
      for (let i = 0; i < result.data.images.length; i++) {
        const imageUrl = result.data.images[i];
        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });

        const imgPath = path.join(__dirname, "cache", `flux_${Date.now()}_${i}.png`);
        fs.writeFileSync(imgPath, imageResponse.data);
        attachments.push(fs.createReadStream(imgPath));
      }
      
      const messageBody = `
╭─────────────────────╮
│ 🎨 𝙈𝙞𝙙𝙟𝙤𝙪𝙧𝙣𝙚𝙮 𝙄𝙢𝙖𝙜𝙚 𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙤𝙧
╰─────────────────────╯

📝 𝐏𝐫𝐨𝐦𝐩𝐭 :
${prompt}
`;
      
      await api.sendMessage(
        { body: messageBody, attachment: attachments },
        threadID,
        (err, info) => {
          attachments.forEach(att => {
            try { fs.unlinkSync(att.path); } catch {}
          });

          if (err) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return;
          }
          
          api.setMessageReaction("✅", messageID, () => {}, true);
        },
        messageID
      );

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      const msg = err.response?.data?.error || err.message || "⚠️ Error while generating image.";
      api.sendMessage(msg, threadID, messageID);
    }
  }
};
