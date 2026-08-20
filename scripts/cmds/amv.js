const axios = require("axios");

module.exports = {
  config: {
    name: "amv",
    version: "1.0",
    author: "Toshiro Editz",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search Anime AMV"
    },
    longDescription: {
      en: "Search and send Anime AMV videos."
    },
    category: "media",
    guide: {
      en: "{pn} [keyword]\nExample:\n{pn}\n{pn} zoro"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    let keyword = args.join(" ").trim();

    if (!keyword) keyword = "amv";

    // reaction while starting
    api.setMessageReaction("🎀", event.messageID, () => {}, true);

    const searching = await message.reply(
`🔎 Searching...
Please wait...`
    );

    try {
      const { data } = await axios.get(
        `https://toshiro-api-editz6t9.vercel.app/api/search/amv?keyword=${encodeURIComponent(keyword)}`
      );

      if (!data.success || !data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        await message.unsend(searching.messageID);
        return message.reply("❌ | No AMV found.");
      }

      const info = data.result;

      await message.unsend(searching.messageID);

      // done reaction
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      return api.sendMessage(
        {
          body:
`╭━〔 🎬 Anime AMV 〕━╮
🎥 Title: ${info.title}
📦 Size: ${info.size}
🔎 Search: ${data.keyword}
━━━━━━━━━━━━━━
✨ Enjoy your AMV!
👑 Author: Anik Islam Sadik
╰━━━━━━━━━━━━━━╯`,
          attachment: await global.utils.getStreamFromURL(info.download)
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error(err);

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      if (searching?.messageID) {
        await message.unsend(searching.messageID).catch(() => {});
      }

      return message.reply("❌ | Failed to fetch AMV. Try again later.");
    }
  }
};
