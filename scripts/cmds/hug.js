const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "hug",
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    description:
      "🤗 Create a cute hug image between you and your tagged partner! Just tag or reply to someone 💞",
    category: "love",
    guide: {
      en: "{pn} @tag or reply — Generate hug image 🤗"
    }
  },

  langs: {
    en: {
      noTag: "Please tag someone or reply to their message to use this command 🤗",
      fail: "❌ | Couldn't generate hug image, Please try again later."
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    let uid2 = Object.keys(event.mentions || {})[0];
    if (!uid2 && event.messageReply?.senderID) uid2 = event.messageReply.senderID;
    if (!uid2) return message.reply(getLang("noTag"));

    try {
      const [name1, name2] = await Promise.all([
        usersData.getName(uid1).catch(() => "Unknown"),
        usersData.getName(uid2).catch(() => "Unknown")
      ]);

      const [avatar1, avatar2] = await Promise.all([
        usersData.getAvatarUrl(uid1),
        usersData.getAvatarUrl(uid2)
      ]);

      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;
      const apiURL = `${apiBase}/api/hug?boy=${encodeURIComponent(avatar1)}&girl=${encodeURIComponent(avatar2)}`;

      const response = await axios.get(apiURL, { responseType: "arraybuffer" });

      const savePath = path.join(__dirname, "tmp");
      await fs.ensureDir(savePath);
      const imgPath = path.join(savePath, `${uid1}_${uid2}_hug.jpg`);
      await fs.writeFile(imgPath, response.data);

      const text = `🤗 ${name1} just hugged ${name2}! ❤️`;
      await message.reply({
        body: text,
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, 5000);

    } catch (err) {
      console.error("❌ Hug command error:", err);
      return message.reply(getLang("fail"));
    }
  }
};
