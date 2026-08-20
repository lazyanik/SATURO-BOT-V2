const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "rajakar",
    version: "12.0.5",
    author: "Anik Islam Sadik",
    countDown: 1,
    role: 0,
    category: "fun",
    description: "Create a rajakar image by mentioning or replying to a user.",
    guide: {
      en: "{pn} @mention or reply"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID = senderID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    const imgPath = path.join(cacheDir, `rk_${targetID}.png`);

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      const backgroundUrl = "https://files.catbox.moe/vu57u2.jpg";
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const [bgImg, avatarImg] = await Promise.all([
        loadImage(backgroundUrl),
        loadImage(avatarUrl)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const userImageSize = 120; 
      const x = canvas.width - userImageSize - 75; 
      const y = (canvas.height / 2) - (userImageSize / 2) - 15; 

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + userImageSize / 2, y + userImageSize / 2, userImageSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, x, y, userImageSize, userImageSize);
      ctx.restore();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, buffer);

      // All Bengali text changed to English
      return api.sendMessage({
        body: `‎এই যে দেখেন আমাদের নতুন রাজাকার: ${userName}`,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, messageID);

    } catch (error) {
      console.log("RAJAKAR ERROR:", error);
      return api.sendMessage("Something went wrong, please try again later.", threadID, messageID);
    }
  }
};
