const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_BASE = "https://tenzo.is-a.dev/api/tools/4k";
const CACHE_DIR = path.join(__dirname, 'cache');

function extractImageUrl(args, event) {
  let imageUrl = args.find(arg => arg.startsWith('http'));
  if (!imageUrl && event.messageReply?.attachments?.length > 0) {
    const img = event.messageReply.attachments.find(a => a.type === 'photo' || a.type === 'image');
    if (img?.url) imageUrl = img.url;
  }
  return imageUrl;
}

module.exports = {
  config: {
    name: "4k",
    version: "4.1",
    author: "Mahi",
    countDown: 15,
    role: 0,
    category: "image",
    guide: "4k <url> OR reply to image"
  },

  onStart: async function ({ args, message, event }) {
    const imageUrl = extractImageUrl(args, event);
    if (!imageUrl) return message.reply("❌ Please provide an image URL or reply to an image");

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    await message.reaction("⏳", event.messageID);

    let filePath;
    try {
      const response = await axios.get(`${API_BASE}?url=${encodeURIComponent(imageUrl)}`, {
        responseType: 'stream',
        timeout: 120000
      });

      filePath = path.join(CACHE_DIR, `4k_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await message.reaction("🎀", event.messageID);
      await message.reply({
        body: `✅ | Your image has been upscaled`,
        attachment: fs.createReadStream(filePath)
      });
      
      setTimeout(() => fs.unlink(filePath).catch(() => {}), 10000);

    } catch (e) {
      await message.reaction("❌", event.messageID);
      await message.reply(`❌ ${e.message}`);
      if (filePath && fs.existsSync(filePath)) fs.unlink(filePath).catch(() => {});
    }
  }
};
