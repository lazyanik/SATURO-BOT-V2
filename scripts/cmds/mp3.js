const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "mp3",
    aliases: ["convertmp3", "convertmp3"],
    version: "1.0.0",
    role: 0,
    author: "Anik Islam Sadik",
    shortDescription: "Convert video to MP3 🎧",
    longDescription: "Download video from URL and convert to MP3.",
    category: "media",
    guide: "{p}convertmp3 <video_url>"
  },

  onStart: async function({ api, args, event }) {
    const { threadID, messageID } = event;

    try {
      // 🔗 Get video URL from args or replied message
      const url = args.join(" ") || event.messageReply?.attachments?.[0]?.url;
      if (!url) return api.sendMessage("⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠɪᴅᴇᴏ ᴜʀʟ!", threadID, messageID);

      // ⏳ Font ABC style message
      api.sendMessage("Mᴘ3 ᴘʀᴏᴄᴇssɪɴɢ ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ⏳", threadID, messageID);

      // 📥 Download video
      const { data } = await axios.get(url, { responseType: "arraybuffer" });

      // 💾 Save as MP3
      const filePath = path.join(__dirname, "/cache/video.mp3");
      fs.writeFileSync(filePath, Buffer.from(data));

      // 🔊 Send back as attachment
      api.sendMessage({
        body: "Mᴘ3 ʀᴇᴀᴅʏ ✅",
        attachment: fs.createReadStream(filePath)
      }, threadID, async () => {
        fs.unlinkSync(filePath); // Delete after sending
      }, messageID);

    } catch (err) {
      console.log(err);
      api.sendMessage("⚠️ Fᴀɪʟᴇᴅ ᴛᴏ ᴄᴏɴᴠᴇʀᴛ ᴠɪᴅᴇᴏ!", threadID, messageID);
    }
  }
};
