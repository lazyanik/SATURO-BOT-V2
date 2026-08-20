const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
module.exports = {
  config: {
    name: "crush",
    author: "Fahad Islam",
    role: 0,
    shortDescription: "Get Crush Pair with 10 background choices",
    longDescription: "Mention/Reply to match, or just type /crush for auto random match based on gender.",
    category: "love",
    guide: "{pn} [1-10] @mention or just {pn}",
  },
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const backgrounds = {
      "1": "https://i.ibb.co/JJs3jfx/1775965116121.jpg",
      "2": "https://i.ibb.co/GQ5qGR96/1775964158698.jpg",
      "3": "https://i.ibb.co/N66SxNXH/1775962824519.jpg",
      "4": "https://i.ibb.co/21BPB1wh/1775964220248.jpg",
      "5": "https://i.ibb.co/p5BBGTf/1775964424333.jpg",
      "6": "https://i.ibb.co/DgppzVCW/1775964458440.jpg",
      "7": "https://i.ibb.co/fzJpfmh6/1775964492822.jpg",
      "8": "https://i.ibb.co/C5VSZjt3/1775968391713.jpg",
      "9": "https://i.ibb.co/ycnv25ZB/1775964987791.jpg",
      "10": "https://i.ibb.co/KjKcFr4t/1775962793117.jpg"
    };
    let bgChoice = args[0];
    if (!backgrounds[bgChoice]) {
      bgChoice = Math.floor(Math.random() * 10) + 1;
    }
    let bgUrl = backgrounds[bgChoice];
    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const { userInfo } = threadInfo;
        const myData = userInfo.find((user) => user.id === senderID);
        if (!myData || !myData.gender) {
          return api.sendMessage("⚠️ Could not determine your gender to find a match.", threadID, messageID);
        }
        const myGender = myData.gender.toUpperCase();
        let matchCandidates = [];
        if (myGender === "MALE") {
          matchCandidates = userInfo.filter(user => user.gender === "FEMALE" && user.id !== senderID);
        } else if (myGender === "FEMALE") {
          matchCandidates = userInfo.filter(user => user.gender === "MALE" && user.id !== senderID);
        } else {
          return api.sendMessage("⚠️ Your gender is undefined. Cannot find a match.", threadID, messageID);
        }
        if (matchCandidates.length === 0) {
          return api.sendMessage("❌ No suitable match found in the group.", threadID, messageID);
        }
        const randomMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
        targetID = randomMatch.id;
      } catch (e) {
        return api.sendMessage("❌ Error fetching group members for auto-match.", threadID, messageID);
      }
    }
    const cachePath = __dirname + "/cache";
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
    const pathImg = `${cachePath}/crush_${Date.now()}.png`;
    try {
      const avt1Url = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
      const avt2Url = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
      const [bgRes, avt1Res, avt2Res] = await Promise.all([
        axios.get(bgUrl, { responseType: "arraybuffer" }),
        axios.get(avt1Url, { responseType: "arraybuffer" }),
        axios.get(avt2Url, { responseType: "arraybuffer" })
      ]);
      const bg = await loadImage(bgRes.data);
      const avt1 = await loadImage(avt1Res.data);
      const avt2 = await loadImage(avt2Res.data);
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      const drawCircularImage = (ctx, image, x, y, size) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, x, y, size, size);
        ctx.restore();
      };
      drawCircularImage(ctx, avt1, 110, 130, 220); 
      drawCircularImage(ctx, avt2, 510, 125, 220); 
      const finalBuffer = canvas.toBuffer("image/png");
      fs.writeFileSync(pathImg, finalBuffer);
      const allUserInfo = await api.getUserInfo([senderID, targetID]);
      const name1 = allUserInfo[senderID]?.name || "User";
      const name2 = allUserInfo[targetID]?.name || "Crush";
      const lovePercent = Math.floor(Math.random() * 21) + 80;
      const messageBody = `╭━━━━━━━ ❤️ ━━━━━━━╮\n` +
                          `       🌹 𝐂𝐑𝐔𝐒𝐇 𝐌𝐀𝐓𝐂𝐇 🌹\n` +
                          `╰━━━━━━━ ❤️ ━━━━━━━╯\n\n` +
                          `✨ ${name1} \n` +
                          `💞 ${name2}\n\n` +
                          `🕊️ 𝐂𝐨𝐦𝐩𝐚𝐭𝐢𝐛𝐢𝐥𝐢𝐭𝐲: ${lovePercent}%\n` +
                          `💌 ❝ You both look like a perfect match! ❞\n`;
      return api.sendMessage({
        body: messageBody,
        attachment: fs.createReadStream(pathImg),
      }, threadID, () => fs.unlinkSync(pathImg), messageID);
    } catch (err) {
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }
};
