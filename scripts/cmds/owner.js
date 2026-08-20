const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    aliases: ["info"],
    version: "1.3.0",
    author: "Anik Islam Sadik",
    role: 0,
    shortDescription: "Owner information with image",
    category: "Information",
    guide: {
      en: "owner"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerText = 
`╭─ 👑 Oᴡɴᴇʀ Iɴғᴏ 👑 ─╮
│ 👤 Nᴀᴍᴇ       : ꫝɴ֟፝ɪᴋ ɪsʟꫝᴍ ѕꫝᴅɪᴋ 
│ 🦋 Nɪᴄᴋ       : কাঁঠ গোলাপ 
│ 🎂 Aɢᴇ        : 𝟭𝟴+
│ 💘 Rᴇʟᴀᴛɪᴏɴ : 𝗠𝗶𝗻𝗴𝗲𝗹
│ 🎓 Pʀᴏғᴇssɪᴏɴ : 𝗦𝘁𝘂𝗱𝗲𝗻𝘁
│ 📚 Eᴅᴜᴄᴀᴛɪᴏɴ : 𝗜𝗻𝘁𝗲𝗿 𝟸𝗻𝗱
│ 🏡 Lᴏᴄᴀᴛɪᴏɴ : 𝗠𝗮𝗗𝗮𝗥𝗶𝗣𝘂𝗥
├─ 🔗 Cᴏɴᴛᴀᴄᴛ ─╮
│ 📘 Facebook  :  id=61590594545013
│ 💬 Messenger: id=61590594545013
│ 📞 WhatsApp  : 01342-925672
╰────────────────╯`;

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "owner.jpg");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgLink = "https://i.imgur.com/gyVwtoC.gif";

    const send = () => {
      api.sendMessage(
        {
          body: ownerText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );
    };

    request(encodeURI(imgLink))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send)
  }
};
