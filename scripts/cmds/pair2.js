const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "pair2",
    aliases: ["pr2","pair 2"],
    version: "1.1.0",
    author: "rX (converted to GoatBot)",
    role: 0,
    category: "fun",
    shortDescription: "Pair two users with love percentage",
    longDescription: "Pair two users with a fun compatibility score and image",
    guide: {
      en: "{pn} @mention / reply / random"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, senderID, messageID, mentions, type, messageReply, body } = event;

    const canvasDir = path.join(__dirname, "cache", "canvas");
    const bgPath = path.join(canvasDir, "maria.png");

    if (!fs.existsSync(canvasDir)) fs.mkdirSync(canvasDir, { recursive: true });
    if (!fs.existsSync(bgPath)) {
      const img = await axios.get(
        "https://i.postimg.cc/TPKqsZ0L/r07qxo-R-Download.jpg",
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(bgPath, Buffer.from(img.data));
    }

    const percentages = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', '0%', '48%'];
    const matchRate = percentages[Math.floor(Math.random() * percentages.length)];

    const senderInfo = await api.getUserInfo(senderID);
    const senderName = senderInfo[senderID].name;

    let partnerID, partnerName;

    // 1️⃣ Mention
    if (mentions && Object.keys(mentions).length > 0) {
      partnerID = Object.keys(mentions)[0];
    }
    // 2️⃣ Reply
    else if (type === "message_reply" && messageReply?.senderID) {
      partnerID = messageReply.senderID;
    }
    // 3️⃣ Random
    else {
      const threadInfo = await api.getThreadInfo(threadID);
      const users = threadInfo.participantIDs.filter(id => id !== senderID);
      partnerID = users[Math.floor(Math.random() * users.length)];
    }

    const partnerInfo = await api.getUserInfo(partnerID);
    partnerName = partnerInfo[partnerID].name;

    const imgPath = await makeImage(senderID, partnerID, bgPath);

    return api.sendMessage({
      body:
        `🥰 Successful pairing\n` +
        `• ${senderName} 🎀\n` +
        `• ${partnerName} 🎀\n\n` +
        `💌 Wish you two hundred years of happiness ❤️❤️\n` +
        `Love percentage: ${matchRate} 💙`,
      mentions: [
        { id: senderID, tag: senderName },
        { id: partnerID, tag: partnerName }
      ],
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath), messageID);
  }
};

// ===== Image Generator =====
async function makeImage(one, two, bgPath) {
  const __root = path.join(__dirname, "cache", "canvas");
  const { Jimp } = jimp;

  const avatarOne = path.join(__root, `avt_${one}.png`);
  const avatarTwo = path.join(__root, `avt_${two}.png`);
  const outPath = path.join(__root, `pair_${one}_${two}.png`);

  const getAvatar = async (uid, savePath) => {
    const res = await axios.get(
      `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );
    fs.writeFileSync(savePath, Buffer.from(res.data));
  };

  await getAvatar(one, avatarOne);
  await getAvatar(two, avatarTwo);

  const bg = await Jimp.read(bgPath);
  const avt1 = await circle(avatarOne);
  const avt2 = await circle(avatarTwo);

  bg
    .composite(avt1.resize({ w: 145, h: 145 }), 159, 167)
    .composite(avt2.resize({ w: 145, h: 145 }), 442, 172);

  await bg.write(outPath);

  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return outPath;
}

async function circle(imgPath) {
  const { Jimp } = jimp;
  const img = await Jimp.read(imgPath);
  img.circle();
  return img;
    }
