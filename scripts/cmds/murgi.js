const { get } = require("axios");
const { createCanvas, loadImage } = require("canvas");
const { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } = require("fs-extra");
const { join } = require("path");

let cachedTemplate = null;

module.exports = {
  config: {
    name: "murgi",
    aliases: ["chicken", "poultry", "cluck"],
    version: "3.2",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Turn someone into a chicken" },
    longDescription: { en: "Overlay user avatar on a chicken template" },
    category: "FUN & SOCIAL",
    guide: { en: "{pn} @mention / reply / UID" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply, mentions, type } = event;

    let targetID = null;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0 && /^\d+$/.test(args[0])) {
      targetID = args[0];
    } else {
      targetID = senderID;
    }

    if (!targetID) {
      return api.sendMessage("❌ No target found.", threadID, messageID);
    }

    let userInfo;
    try {
      userInfo = await api.getUserInfo(targetID);
    } catch (e) {
      console.error("Error fetching user info:", e);
      return api.sendMessage("❌ Failed to fetch user info.", threadID, messageID);
    }

    const user = userInfo[targetID];
    if (!user) {
      return api.sendMessage("❌ User not found.", threadID, messageID);
    }

    const name = user.name || "Unknown";

    api.setMessageReaction("🐣", messageID, () => {}, true);

    const tempMsg = await api.sendMessage(`⏳ দাঁড়া ${name} কে মুরগি বানাচ্ছি... 🐔`, threadID);

    try {
      const imageStream = await generateChickenImage(targetID);
      await api.unsendMessage(tempMsg.messageID);

      const reply = `🐔 এই নে মুরগি বানিয়ে দিলাম ${name}!`;

      await api.sendMessage(
        {
          body: reply,
          attachment: imageStream,
          mentions: [{ tag: name, id: targetID }]
        },
        threadID,
        () => {
          if (imageStream.path && existsSync(imageStream.path)) {
            unlinkSync(imageStream.path);
          }
        },
        messageID
      );

      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.error("Chicken generation error:", err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ মুরগি বানাতে সমস্যা হয়েছে! Error: ${err.message || err}`, threadID, messageID);
    }
  }
};

async function getTemplateImage() {
  if (cachedTemplate) return cachedTemplate;

  const CACHE = join(__dirname, "cache");
  if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });

  const templatePath = join(CACHE, "chicken_template.png");
  if (existsSync(templatePath)) {
    const buffer = readFileSync(templatePath);
    cachedTemplate = await loadImage(buffer);
    return cachedTemplate;
  }

  const templateUrl = "https://i.imgur.com/eitR3yP.jpeg";
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await get(templateUrl, {
        responseType: "arraybuffer",
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      const buffer = Buffer.from(response.data);
      writeFileSync(templatePath, buffer);
      cachedTemplate = await loadImage(buffer);
      return cachedTemplate;
    } catch (err) {
      lastError = err;
      console.error(`Template download attempt ${attempt} failed:`, err.message);
      if (err.response && err.response.status === 429) {
        const wait = attempt * 2000;
        await new Promise(r => setTimeout(r, wait));
      } else {
        break;
      }
    }
  }

  throw new Error(`Failed to download template after 3 attempts: ${lastError.message}`);
}

async function generateChickenImage(targetId) {
  const CACHE = join(__dirname, "cache");
  if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });

  const avatarUrl = `https://graph.facebook.com/${targetId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  let avatarBuf;
  try {
    const response = await get(avatarUrl, {
      responseType: "arraybuffer",
      timeout: 15000
    });
    avatarBuf = response.data;
  } catch (err) {
    throw new Error("Failed to download avatar: " + err.message);
  }

  const [avatarImg, templateImg] = await Promise.all([
    loadImage(avatarBuf),
    getTemplateImage()
  ]);

  const canvas = createCanvas(templateImg.width, templateImg.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(templateImg, 0, 0);

  const x = 410, y = 60, size = 80;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarImg, x, y, size, size);
  ctx.restore();

  const outPath = join(CACHE, `chicken_${targetId}.png`);
  writeFileSync(outPath, canvas.toBuffer());

  const stream = require("fs").createReadStream(outPath);
  stream.path = outPath;
  return stream;
  }
