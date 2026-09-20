const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "marry",
    aliases: ["married", "biya", "engage"], 
    version: "4.0",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: "Propose with custom image",
    longDescription: "Generate a marriage proposal image with user avatars placed over characters.",
    category: "love",
    guide: "{pn} @mention or reply to a message"
  },

  onStart: async function ({ message, event, usersData }) {
    let mentionedID;

    // Check if user mentioned someone or replied to a message
    if (Object.keys(event.mentions).length > 0) {
      mentionedID = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply" && event.messageReply.senderID) {
      mentionedID = event.messageReply.senderID;
    } else {
      return message.reply("Please mention someone or reply to their message!");
    }

    const senderID = event.senderID;

    try {
      const nameSender = await usersData.getName(senderID);
      const nameMentioned = await usersData.getName(mentionedID);

      const avatarSender =
        (await usersData.getAvatarUrl(senderID)) ||
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
      const avatarMentioned =
        (await usersData.getAvatarUrl(mentionedID)) ||
        `https://graph.facebook.com/${mentionedID}/picture?width=512&height=512`;

      const [avatarImgSender, avatarImgMentioned, bg] = await Promise.all([
        Canvas.loadImage(avatarSender),
        Canvas.loadImage(avatarMentioned),
        Canvas.loadImage("https://i.postimg.cc/VvjW9DwJ/images-8.jpg")
      ]);

      // Fetch user data to determine gender
      const senderData = (await usersData.get(senderID)) || {};
      const mentionedData = (await usersData.get(mentionedID)) || {};

      const isFemale = (g) => g === 1 || String(g).toLowerCase() === "female" || String(g).toLowerCase() === "1";
      const isMale = (g) => g === 2 || String(g).toLowerCase() === "male" || String(g).toLowerCase() === "2";

      let girlAvatar = avatarImgMentioned;
      let boyAvatar = avatarImgSender;

      // Determine correct position based on gender
      if (isFemale(senderData.gender) && isMale(mentionedData.gender)) {
        girlAvatar = avatarImgSender;
        boyAvatar = avatarImgMentioned;
      } else if (isMale(senderData.gender) && isFemale(mentionedData.gender)) {
        girlAvatar = avatarImgMentioned;
        boyAvatar = avatarImgSender;
      } else if (isFemale(senderData.gender)) {
        girlAvatar = avatarImgSender;
        boyAvatar = avatarImgMentioned;
      } else {
        girlAvatar = avatarImgMentioned;
        boyAvatar = avatarImgSender;
      }

      const canvasWidth = 1280;
      const canvasHeight = 1280;
      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);

      const avatarSize = Math.floor(canvasWidth * 0.11);
      const girlHead = { x: 470, y: 310 };
      const boyHead = { x: 690, y: 200 };

      // Render Girl Avatar (Bride - Left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        girlHead.x + avatarSize / 2,
        girlHead.y + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(girlAvatar, girlHead.x, girlHead.y, avatarSize, avatarSize);
      ctx.restore();

      // Render Boy Avatar (Groom - Right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        boyHead.x + avatarSize / 2,
        boyHead.y + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(boyAvatar, boyHead.x, boyHead.y, avatarSize, avatarSize);
      ctx.restore();

      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      const imgPath = path.join(tmpDir, `${senderID}_${mentionedID}_marry.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      const captionText =
        senderID === mentionedID
          ? "Marrying yourself? Self-love is ultimate, but love is best shared! 💍✨"
          : `💖 ${nameSender} ❤️ ${nameMentioned} 💖\n\n"Hand in hand, heart to heart, beginning forever together." 💍🌸`;

      await message.reply(
        {
          body: captionText,
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlink(imgPath).catch(() => {})
      );

      canvas.width = canvas.height = 0;
      if (global.gc) global.gc();

    } catch (err) {
      console.error("Error in marry command:", err);
      message.reply(`An error occurred: ${err.message}`);
    }
  }
};
