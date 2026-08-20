const axios = require("axios");

module.exports = {
  config: {
    name: "stid",
    aliases: ["stickerid", "st"],
    version: "1.0",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get ID of a replied sticker" },
    longDescription: { en: "Extract and show the ID of a sticker from a replied message" },
    category: "utility",
    guide: { en: "{pn} (reply to a sticker)" }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("❌ Please reply to a sticker message.");
    }

    const attachments = messageReply.attachments;

    for (const attachment of attachments) {
      if (attachment.type === "sticker") {
        const stickerID = attachment.ID || attachment.id || attachment.stickerID;
        if (stickerID) {
          return message.reply(`${stickerID}`);
        } else {
          return message.reply("❌ Could not find sticker ID.");
        }
      }
    }

    return message.reply("❌ The replied message does not contain a sticker.");
  }
};
