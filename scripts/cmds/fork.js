module.exports = {
  config: {
    name: "fork",
    aliases: ["repo", "source"],
    version: "2.0",
    author: "Anik Islam Sadik",
    countDown: 3,
    role: 0,
    longDescription: "Returns the link to the official repository.",
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function({ message }) {
    const text = "╭•┈•『 🤍 𝐒𝐀𝐓𝐔𝐑𝐎-𝐁𝐎𝐓-𝐕𝟐 💖 』•┈•╮\n\n" +
                 "⚡ 𝐒𝐭𝐚𝐭𝐮𝐬 ──► 𝐀𝐜𝐭𝐢𝐯𝐞 & 𝐒𝐭𝐚𝐛𝐥𝐞\n" +
                 "👑 𝐂𝐫𝐞𝐚𝐭𝐨𝐫 ──► 𝐀𝐧𝐢𝐤 𝐈𝐬𝐥𝐚𝐦 𝐒𝐚𝐝𝐢𝐤\n" +
                 "🔗 𝐑𝐞𝐩𝐨 ────► https://github.com/lazyanik/SATURO-BOT-V2.git\n\n" +
                 "╰•┈•『 ✓ 𝐊𝐞𝐞𝐩 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐢𝐧𝐠 ❤️ 』•┈•╯";
    
    message.reply(text);
  }
};
