const A = require("axios");
const B = require("fs-extra");
const C = require("path");
const S = require("yt-search");

const p = C.join(__dirname, "cache", `${Date.now()}.mp3`);

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "song",
    version: "0.0.1",
    author: "ArYAN",
    countDown: 10,
    role: 0,
    category: "media"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID: t, messageID: m } = event;
    const q = args.join(" ");
    if (!q) return api.sendMessage("❌ Please provide a song name or link.", t, m);

    api.setMessageReaction("⏳", m, event.threadID, () => {}, true);

    try {
      const D = await A.get(nix);
      const E = D.data.api;
      
      let u = q;
      if (!q.startsWith("http")) {
        const r = await S(q);
        const v = r.videos[0];
        if (!v) throw new Error("Error ytdl issue 🧘");
        u = v.url;
      }

      const F = await A.get(`${E}/ytdl`, {
        params: { url: u, type: "audio" }
      });

      if (!F.data.status || !F.data.downloadUrl) throw new Error("API Error");

      const DL = F.data.downloadUrl;
      const title = F.data.title || "Song";

      const res = await A.get(DL, { responseType: "arraybuffer" });
      await B.outputFile(p, Buffer.from(res.data));

      api.setMessageReaction("✅", m, event.threadID, () => {}, true);

      return api.sendMessage({
        body: `🎵 Title: ${title}`,
        attachment: B.createReadStream(p)
      }, t, () => {
        if (B.existsSync(p)) B.unlinkSync(p);
      }, m);

    } catch (e) {
      api.setMessageReaction("❌", m, event.threadID, () => {}, true);
      return api.sendMessage(`❌ Error: ${e.message}`, t, m);
    }
  }
};
