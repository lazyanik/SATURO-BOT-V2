const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "pregnant",
  version: "1.0.0",
  author: "Anik Islam Sadik",
  cooldowns: 15,
  role: 0,
  aliases: ["pgt"],
  shortDescription: "Turn user into pregnant photo",
  longDescription: "Puts mentioned/replied user's avatar into the provided pregnant meme template.",
  category: "fun",
  guide: { en: "{pn} @mention or reply" }
};

module.exports.onStart = async function ({ api, event, message, usersData }) {
  try {
    let targetID = Object.keys(event.mentions || {})[0];
    if (event.type === "message_reply" && event.messageReply) {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) return message.reply("🤰 Tag or reply to someone!");

    // Protect owner
    const ownerID = "100069254151118";
    if (targetID === ownerID) return message.reply("🚫 𝗬𝗼𝘂 𝗱𝗲𝘀𝗲𝗿𝘃𝗲 𝘁𝗵𝗶𝘀,𝗻𝗼𝘁 𝗺𝘆 𝗼𝘄𝗻𝗲𝗿 😙");

    const base = path.join(__dirname, "..", "resources");
    if (!fs.existsSync(base)) fs.mkdirSync(base);

    const templateURL = "https://files.catbox.moe/t5jk3l.png";
    const templatePath = path.join(base, "pregnant_template.png");
    const avatarPath = path.join(base, `avatar_${targetID}.png`);
    const outputPath = path.join(base, `pregnant_${targetID}.png`);

    // Download template if needed
    if (!fs.existsSync(templatePath)) {
      const t = await axios.get(templateURL, { responseType: "arraybuffer" });
      fs.writeFileSync(templatePath, t.data);
    }

    // Download user avatar
    const av = await axios.get(
      `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );
    fs.writeFileSync(avatarPath, av.data);

    // Load images
    const bg = await loadImage(templatePath);
    const avatar = await loadImage(avatarPath);

    // Canvas
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, bg.width, bg.height);

    // Position avatar
    const size = 100;         // avatar size
    const x = 200;            // adjust X to fit face perfectly
    const y = 80;            // adjust Y to fit face perfectly

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    // Save image
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    let name = "Someone";
    try {
      const info = await usersData.get(targetID);
      name = info?.name || name;
    } catch {}

    await message.reply({
      body: `😂 @${name} এখন প্রেগন্যান্ট মুডে! 🤰`,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(outputPath)
    });

    fs.unlinkSync(avatarPath);
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.log(err);
    message.reply("❌ Error generating pregnant meme.");
  }
};
