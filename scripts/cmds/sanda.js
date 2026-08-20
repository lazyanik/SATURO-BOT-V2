const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sanda",
    version: "2.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Convert someone into a cow" },
    longDescription: { en: "Put user's profile picture on a cow image using canvas" },
    category: "FUN & SOCIAL",
    guide: { en: "{pn} @mention / reply / UID" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, mentions, type, messageReply, senderID } = event;

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let targetID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0 && !isNaN(args[0])) {
      targetID = args[0];
    } else {
      targetID = senderID;
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const pathImg = path.join(cacheDir, `sanda_${targetID}.png`);

    try {
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID].name;

      const cowImgUrl = "https://i.imgur.com/7LVW8zI.jpeg";
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const [cowImg, avatarImg] = await Promise.all([
        loadImage(cowImgUrl),
        loadImage(avatarUrl)
      ]);

      const canvasObj = createCanvas(cowImg.width, cowImg.height);
      const ctx = canvasObj.getContext("2d");

      ctx.drawImage(cowImg, 0, 0, canvasObj.width, canvasObj.height);

      const x = 440;
      const y = 190;
      const size = 100;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, x, y, size, size);
      ctx.restore();

      fs.writeFileSync(pathImg, canvasObj.toBuffer());

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage({
        body: `🚨 BREAKING NEWS 🚨\n\nসাহারা মরুভূমিতে বিরল প্রজাতির সান্ডা পাওয়া গেছে! বিজ্ঞানিরা নিশ্চিত করেছেন এটি আর কেউ নয়,আমাদের ${name} 🦎☀️`,
        attachment: fs.createReadStream(pathImg)
      }, threadID, () => {
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      }, messageID);

    } catch (e) {
      console.error(e);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("Error executing command ❌", threadID, messageID);
    }
  }
};
