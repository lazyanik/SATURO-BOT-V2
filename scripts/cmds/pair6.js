const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair6",
    aliases: ["pr6", "pair 6"],
    version: "1.0.0",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: "Random & Reply Pair System",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const { threadID, senderID, messageID, participantIDs, messageReply } = event;
      
      // Reply System Logic
      let targetID;
      if (messageReply) {
        targetID = messageReply.senderID;
      } else {
        const users = participantIDs.filter(id => id !== senderID && id !== api.getCurrentUserID());
        if (!users.length) return api.sendMessage("Group e onno kono member nei!", threadID, messageID);
        targetID = users[Math.floor(Math.random() * users.length)];
      }

      const [name1, name2] = await Promise.all([
        usersData.getName(senderID),
        usersData.getName(targetID)
      ]);
      
      const bg = await loadImage("https://i.imgur.com/8BgCK2I.jpeg");
      const img1 = await loadImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      const img2 = await loadImage(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0);

      const drawPic = (img, x, y, size) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      };

      // X, Y, Z(Size) Setup
      const x1 = 80, y1 = 60, size1 = 145; // User 1 (Left)
      const x2 = 510, y2 = 210, size2 = 150; // User 2 (Right)

      drawPic(img1, x1, y1, size1); 
      drawPic(img2, x2, y2, size2); 

      const pathImg = __dirname + `/cache/pair7_${senderID}.png`;
      fs.ensureDirSync(__dirname + "/cache");
      fs.writeFileSync(pathImg, canvas.toBuffer("image/png"));

      // Stylish Message Body
      const stylishBody = `✨ 🎉 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 🎉 ✨\n\n💖 ━━━  [ 👩‍❤️‍👨 ]  ━━━ 💖\n\n🥰 ${name1}\n       ❤️ 𝗫 ❤️\n😍 ${name2}\n\n💖 ━━━  [ 👩‍❤️‍👨 ]  ━━━ 💖\n\n🌸 𝗠𝗮𝘆 𝘁𝗵𝗶𝘀 𝗯𝗼𝗻𝗱 𝗯𝗲 𝗳𝗼𝗿𝗲𝘃𝗲𝗿 𝗯𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹! 🦋`;

      api.sendMessage({
        body: stylishBody,
        mentions: [{ tag: name1, id: senderID }, { tag: name2, id: targetID }],
        attachment: fs.createReadStream(pathImg)
      }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
      console.error(e);
      api.sendMessage("Error occurred!", event.threadID, event.messageID);
    }
  }
};
