const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "alien",
    aliases: ["spacealien"],
    version: "1.1",
    author: "Anik Islam Sadik",
    cooldowns: 5,
    role: 0,
    shortDescription: { en: "Alien canvas meme generator" },
    longDescription: { en: "Place user profile picture on alien image using reply, mention, or UID." },
    category: "FUN AND SOCIAL",
    guide: { en: "{p}{n} [@mention / reply / UID]" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { senderID, mentions, messageReply, threadID, messageID } = event;

    const X_POSITION = 170;
    const Y_POSITION = 125;
    const AVATAR_SIZE = 80;

    let targetID;
    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    } else {
      targetID = senderID;
    }

    const bgUrl = "https://i.imgur.com/aCJnVlu.jpeg";
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const outputPath = path.join(cacheDir, `alien_${targetID}.png`);

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    };

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "Friend";

      const fetchImg = async (url) => {
        const res = await axios.get(url, { responseType: "arraybuffer", headers });
        return loadImage(Buffer.from(res.data));
      };

      const [bgImg, avatarImg] = await Promise.all([
        fetchImg(bgUrl),
        fetchImg(avatarUrl).catch(() => loadImage("https://i.ibb.co/4pDNDR1/avatar.png"))
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        X_POSITION + AVATAR_SIZE / 2,
        Y_POSITION + AVATAR_SIZE / 2,
        AVATAR_SIZE / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatarImg, X_POSITION, Y_POSITION, AVATAR_SIZE, AVATAR_SIZE);
      ctx.restore();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      api.setMessageReaction("✅", messageID, () => {}, true);

      const randomMsg = `সবাই সাবধান! ${userName} আসলে মানুষ নয়,এলিয়েন গ্রহ থেকে পাঠানো গুপ্তচর!!👾🪐`;

      return api.sendMessage(
        { 
          body: randomMsg,
          attachment: fs.createReadStream(outputPath) 
        },
        threadID,
        () => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        },
        messageID
      );

    } catch (error) {
      console.error("Error in alien command:", error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply("Failed to generate image.");
    }
  }
};
