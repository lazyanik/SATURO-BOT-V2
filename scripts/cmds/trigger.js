const DIG = require("discord-image-generation");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "trigger",
    author: "Toshiro Editz",
    category: "fun",
    role: 0,
    countDown: 5
  },

  onStart: async function ({ event, message }) {
    try {
      let uid = event.senderID;
      if (event.messageReply) uid = event.messageReply.senderID;
      else if (Object.keys(event.mentions).length)
        uid = Object.keys(event.mentions)[0];

      // ✅ Facebook avatar URL
      const avatarURL =
        `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // ✅ Download avatar as buffer
      const avatarRes = await axios.get(avatarURL, {
        responseType: "arraybuffer"
      });
      const avatarBuffer = Buffer.from(avatarRes.data);

      // ✅ DIG needs Buffer / URL (NOT file path)
      const img = await new DIG.Triggered().getImage(avatarBuffer);

      const outPath = path.join(__dirname, "cache", `${uid}_trigger.gif`);
      await fs.ensureDir(path.dirname(outPath));
      await fs.writeFile(outPath, img);

      message.reply({
        attachment: fs.createReadStream(outPath)
      }, () => fs.unlinkSync(outPath));

    } catch (err) {
      console.error(err);
      message.reply("❌ A problem has been detected. Please try again later.");
    }
  }
};
