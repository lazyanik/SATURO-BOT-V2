const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

const authToken = "350685531728|62f8ce9f74b12f84c123cc23437a4a32";
const bgPool = ["https://i.imgur.com/B318OFJ.jpeg"];

module.exports = {
  config: {
    name: "kill",
    aliases: ["killed"],
    version: "2.0",
    author: "xalman",
    role: 0,
    countDown: 5,
    shortDescription: "Make a kidnap-style image",
    longDescription: "Generate a kidnap-themed image using tagged user avatars.",
    category: "FUN & SOCIAL",
    guide: { en: "{pn} @mention | reply | uid" }
  },

  onStart: async function ({ api, event, message, usersData }) {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const senderID = event.senderID;
    let targetID = null;

    if (event.messageReply?.senderID) {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length) {
      targetID = Object.keys(event.mentions)[0];
    } else {
      const uidMatch = event.body?.match(/\b\d{8,20}\b/);
      if (uidMatch) targetID = uidMatch[0];
    }

    if (!targetID) return message.reply("❌ No target specified.");

    try {
      const [nameA, nameB] = await Promise.all([
        usersData.getName(senderID).catch(() => "You"),
        usersData.getName(targetID).catch(() => "Friend")
      ]);

      const getAvatar = (id) =>
        `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=${authToken}`;

      const [avatarA, avatarB, background] = await Promise.all([
        loadImage(getAvatar(senderID)),
        loadImage(getAvatar(targetID)),
        loadImage(bgPool[Math.floor(Math.random() * bgPool.length)])
      ]);

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0);

      const positions = [
        { x: 150, y: 130, r: 30 },
        { x: 360, y: 290, r: 30 }
      ];

      const placeAvatar = (img, pos) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, pos.x - pos.r, pos.y - pos.r, pos.r * 2, pos.r * 2);
        ctx.restore();
      };

      placeAvatar(avatarA, positions[0]);
      placeAvatar(avatarB, positions[1]);

      const cacheDir = path.join(__dirname, "tmp");
      await fs.ensureDir(cacheDir);
      const outPath = path.join(cacheDir, `${senderID}_${targetID}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer());

      await message.reply({
        body: `${nameA} is killing ${nameB} 💀`,
        attachment: fs.createReadStream(outPath)
      });

      fs.unlinkSync(outPath);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Something went wrong.");
    }
  }
};
