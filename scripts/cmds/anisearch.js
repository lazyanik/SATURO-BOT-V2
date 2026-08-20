const axios = require("axios");

module.exports = {
  config: {
    name: "anisearch",
    aliases: ["ani"],
    version: "2.2",
    author: "Anik Islam Sadik",
    countDown: 3,
    role: 0,
    description: "Search and get Anime TikTok videos",
    category: "ANIME & MEDIA",
    guide: "{pn} <anime name>"
  },

  onStart: async function ({ api, event, message, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    if (!query) return message.reply("❌ Please provide an anime name to search.");

    api.setMessageReaction("✨", messageID, () => {}, true);

    const API_URL = `https://xalman-apis.vercel.app/api/anisearch?q=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(API_URL, { timeout: 15000 });
      const results = res.data.results;

      if (!results || results.length === 0) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply(`❌ No videos found for "${query}".`);
      }

      const video = results[0];
      const stream = await global.utils.getStreamFromURL(video.video_url);

      api.setMessageReaction("✅", messageID, () => {}, true);

      const msg = `🎀 𝗔𝗡𝗜𝗠𝗘 𝗦𝗘𝗔𝗥𝗖𝗛 𝗥𝗘𝗦𝗨𝗟𝗧
━━━━━━━━━━━━━━━━━━`;

      return api.sendMessage({
        body: msg,
        attachment: stream
      }, threadID, messageID);

    } catch (e) {
      console.error(e);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply("❌ Error fetching video. Please try again.");
    }
  }
};
