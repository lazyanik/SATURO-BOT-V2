const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "zombie",
    version: "1.0",
    author: "S4Eren",
    countDown: 5,
    role: 0,
    shortDescription: "Transform images into zombie version",
    longDescription: "Apply zombie effect to any image by replying to it.",
    category: "ai",
    guide: "{p}zombie (reply to an image)"
  },

  onStart: async function ({ api, event, args, message }) {
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!repliedImage || repliedImage.type !== "photo") {
      return message.reply(
        "❌ Please reply to an image.\n\n" +
        "Example:\n" +
        "{p}zombie (reply to any photo)"
      );
    }

    const processingMsg = await message.reply("🧟 Transforming your image into zombie version...");
    const imgPath = path.join(__dirname, "cache", `${Date.now()}_zombie.jpg`);

    try {
      // Build API URL (mode=2 fixed as requested)
      const imageUrl = encodeURIComponent(repliedImage.url);
      const apiUrl = `https://sakura-apis.onrender.com/api/zombie?url=${imageUrl}&mode=2`;

      // Fetch zombie image
      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 60000
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(response.data));

      await api.unsendMessage(processingMsg.messageID);

      await message.reply({
        body: "🧟 Zombie transformation complete!",
        attachment: fs.createReadStream(imgPath)
      });

    } catch (error) {
      console.error("ZOMBIE Error:", error.message);
      await api.unsendMessage(processingMsg.messageID);
      
      if (error.response?.status === 400) {
        message.reply("❌ Invalid image URL or unsupported format. Please try another image.");
      } else if (error.response?.status === 500) {
        message.reply("❌ Server error. The image might be corrupted or unsupported.");
      } else {
        message.reply("❌ Failed to transform image. Please try again later.");
      }
    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};
