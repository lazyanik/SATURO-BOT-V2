const axios = require("axios");

module.exports = {
  config: {
    name: "emojimean",
    aliases: ["emojiinfo"],
    version: "1.0.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Get the meaning of an emoji",
    category: "FUN & SOCIAL",
    guide: "{pn} [emoji]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/mean";

    const emoji = args[0];

    if (!emoji) {
      return api.sendMessage("╭─❍\n│ Usage: {pn} 💀\n╰───────────⟡", threadID, messageID);
    }

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?emoji=${encodeURIComponent(emoji)}`);
      
      if (res.data.status === true) {
        const { name, mean } = res.data.data.meaning;
        const emojiIcon = res.data.data.emoji;

        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage(
          `❖ 𝗘𝗠𝗢𝗝𝗜 𝗠𝗘𝗔𝗡𝗜𝗡𝗚 ❖\n━━━━━━━━━━━━━━━━━━\n` +
          `👤 𝖤𝗆𝗈𝗃𝗂: ${emojiIcon}\n` +
          `📝 𝖭𝖺𝗆𝖾: ${name}\n` +
          `📖 𝖬𝖾𝖺𝗇𝗂𝗇𝗀: ${mean}\n` +
          `━━━━━━━━━━━━━━━━━━`, 
          threadID, messageID
        );
      } else {
        throw new Error("Emoji not found");
      }

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Emoji meaning not found in database!", threadID, messageID);
    }
  }
};
