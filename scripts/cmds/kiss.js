const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "kiss",
    version: "1.5",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: "A fun kiss picture!",
    longDescription: "A fun command to create a kiss picture with the given positions.",
    category: "fun",
    guide: "{pn} @mention or reply",
  },

  onStart: async function ({ event, api, usersData }) {
    let mention = Object.keys(event.mentions)[0];
    let targetID = mention || event.messageReply?.senderID;

    if (!targetID)
      return api.sendMessage("কাকে চুমু দিবে? ট্যাগ কর বা কারো রিপ্লাই দাও!", event.threadID, event.messageID);

    const senderID = event.senderID;

    const getAvatar = async (uid) => {
      try {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatarPath = path.join(__dirname, `${uid}_avatar.png`);
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(avatarPath, res.data);
        return avatarPath;
      } catch (err) {
        console.error(`Error fetching avatar for user ${uid}: ${err.message}`);
        return "";
      }
    };

    const bg = await loadImage("https://i.imgur.com/VniSzhD.png"); 
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0);

    const senderAvatarPath = await getAvatar(senderID);
    const targetAvatarPath = await getAvatar(targetID);

    const senderAvatar = await loadImage(senderAvatarPath);
    const targetAvatar = await loadImage(targetAvatarPath);

    
    ctx.save();
    ctx.beginPath();
    ctx.arc(340, 120, 60, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(targetAvatar, 280, 60, 120, 120);
    ctx.restore();

    
    ctx.save();
    ctx.beginPath();
    ctx.arc(500, 70, 60, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(senderAvatar, 440, 10, 120, 120);
    ctx.restore();

    const output = path.join(__dirname, "kiss_output.png");
    fs.writeFileSync(output, canvas.toBuffer("image/png"));

    const senderName = await usersData.getName(senderID);
    const targetName = event.mentions[mention] || (event.messageReply?.senderName || "Friend");

    api.sendMessage({
      body: `❤️ Kiss time! \n${senderName} gave a kiss to ${targetName}! 💋`,
      attachment: fs.createReadStream(output),
      mentions: [{ tag: targetName, id: targetID }],
    }, event.threadID, () => {
      fs.unlinkSync(output);
      fs.unlinkSync(senderAvatarPath);
      fs.unlinkSync(targetAvatarPath);
    }, event.messageID);
  }
};
