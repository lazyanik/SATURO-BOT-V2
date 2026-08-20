const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const ACCESS_TOKEN = "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

module.exports = {
  config: {
    name: "kicked",
    version: "2.5",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: "Generate a kick image with circular avatars",
    longDescription: "Generate an image showing the sender kicking the mentioned/replied user based on a template.",
    category: "FUN & SOCIAL",
    guide: "{pn} @tag or reply to a message"
  },

  onStart: async function({ event, message }) {
    const uid1 = event.senderID;
    let uid2;

    if (event.messageReply) {
      uid2 = event.messageReply.senderID;
    } else {
      const mentions = Object.keys(event.mentions || {});
      uid2 = mentions[0];
    }

    if (!uid2) return message.reply("Please mention a user or reply to a message to kick! 🦵");

    async function getFbProfilePic(userId) {
      const url = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}&redirect=false`;
      try {
        const res = await axios.get(url);
        return res.data.data.url;
      } catch {
        return `https://graph.facebook.com/${userId}/picture?width=512&height=512`;
      }
    }

    function drawCircleAvatar(ctx, img, x, y, size) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    }

    try {
      const avatar1Url = await getFbProfilePic(uid1);
      const avatar2Url = await getFbProfilePic(uid2);
      const templateUrl = "https://i.imgur.com/DqvoM04.jpeg";

      const [template, img1, img2] = await Promise.all([
        loadImage(templateUrl),
        loadImage(avatar1Url),
        loadImage(avatar2Url)
      ]);

      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      drawCircleAvatar(ctx, img1, 322, 110, 70); 
      drawCircleAvatar(ctx, img2, 175, 160, 70);

      const tmpDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(tmpDir)) fs.ensureDirSync(tmpDir);

      const filePath = path.join(tmpDir, `kicked_${uid1}_${uid2}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      return message.reply({
        body: "🦶🏻💥 DISRESPECTFUL KICK!!!",
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (error) {
      console.error(error);
      return message.reply("⚠️ Error generating image.");
    }
  }
};
