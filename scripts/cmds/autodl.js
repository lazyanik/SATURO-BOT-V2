const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function detectPlatform(url) {
  if (url.includes("tiktok.com")) return "𝙏𝙞𝙠𝙏𝙤𝙠";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠";
  if (url.includes("instagram.com")) return "𝙄𝙣𝙨𝙩𝙖𝙜𝙖𝙢";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "𝙔𝙤𝙪𝙏𝙪𝙗𝙚";
  if (url.includes("x.com") || url.includes("twitter.com")) return "𝙏𝙬𝙞𝙩𝙩𝙚𝙧 / 𝙓";
  if (url.includes("pin.it") || url.includes("pinterest.com")) return "𝙋𝙞𝙣𝙩𝙚𝙧𝙚𝙨𝙩";
  return "𝙐𝙣𝙠𝙣𝙤𝙬𝙣";
}

function extractVideo(data) {
  if (!data) return null;
  const r = data.result || {};
  return (
    r.high_quality ||
    r.video ||
    r.url ||
    data.high_quality ||
    data.video ||
    data.url ||
    null
  );
}

const SUPPORTED = [
  "https://vt.tiktok.com", "https://www.tiktok.com/", "https://vm.tiktok.com",
  "https://www.facebook.com/watch/", "https://www.facebook.com/reel/",
  "https://www.facebook.com/share/v", "https://www.facebook.com/share/r",
  "https://www.instagram.com/reel/", "https://youtu.be/", "https://youtube.com/",
  "https://x.com/", "https://twitter.com/", "https://pin.it/", "https://www.pinterest.com/"
];

module.exports = {
  config: {
    name: "autodl",
    version: "6.5",
    author: "Toshiro Editz",
    role: 0,
    category: "media",
    description: { en: "Auto download videos from multiple platforms" },
    guide: { en: "[video link]" }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const text = event.body || "";
    if (!text.startsWith("http")) return;
    if (!SUPPORTED.some(link => text.startsWith(link))) return;

    api.setMessageReaction("🐤", event.messageID, event.threadID, (err) => {}, true);
    const startTime = Date.now();

    try {
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `autodl_${Date.now()}.mp4`);

      const res = await axios.get(
        "https://toshiro-editz-api.vercel.app/downloader/alldl?url=" + encodeURIComponent(text),
        { timeout: 30000 }
      );

      const downloadUrl = extractVideo(res.data);

      if (!downloadUrl) {
        api.setMessageReaction("❌", event.messageID, event.threadID, (err) => {}, true);
        return api.sendMessage("❌ Video not found or unsupported link", event.threadID);
      }

      const response = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
        timeout: 45000
      });

      await fs.writeFile(filePath, Buffer.from(response.data));

      const info = res.data.result || res.data;
      const platform = detectPlatform(text);
      const speed = ((Date.now() - startTime) / 1000).toFixed(2);

      const msg = {
        body: `╭━〔 ✅ 𝐀𝐮𝐭𝐨 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 〕━╮\n┃ 📌 Title     : ${info.title || "No Title"}\n┃ 🌐 Platform  : ${platform}\n┃ 👤 Author    : ${info.author || "Unknown"}\n┃ ⚡ Speed     : ${speed}s\n╰━━━━━━━━━━━━━━━━╯\n⚡ Powered by —͟͞͞Sᴀ𓆩ᴅ𓆪ɪᴋ 모 ❄️`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) {
            console.error("Upload Error:", err);
        }
        api.setMessageReaction("✅", event.messageID, event.threadID, (err) => {}, true);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, event.messageID);

    } catch (err) {
      console.error("AutoDL Error:", err);
      api.setMessageReaction("❌", event.messageID, event.threadID, (err) => {}, true);
      api.sendMessage(`❌ Error: ${err.message}`, event.threadID);
    }
  }
};
