const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair3",
    aliases: ["pr3"," pair 3"],
    version: "2.0",
    author: "Toshiro Editz",
    countDown: 5,
    role: 0,
    shortDescription: "Pair Match",
    longDescription: "Reply, mention or random pair",
    category: "fun",
    guide: {
      en: "{pn} [reply/@mention]"
    }
  },

  onStart: async function ({ api, event, usersData }) {

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {

      let targetID;
      let targetName;

      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      }

      else if (Object.keys(event.mentions).length) {
        targetID = Object.keys(event.mentions)[0];
      }

      else {

        const thread = await api.getThreadInfo(event.threadID);

        const me = thread.userInfo.find(
          user => user.id == event.senderID
        );

        const myGender =
          me.gender === 2 || me.gender === "FEMALE"
            ? "FEMALE"
            : "MALE";

        const members = thread.userInfo.filter(user => {

          if (user.id == event.senderID)
            return false;

          if (myGender === "MALE")
            return user.gender === 2 || user.gender === "FEMALE";

          return user.gender === 1 || user.gender === "MALE";

        });

        if (!members.length) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);

          return api.sendMessage(
            "❌ No suitable partner found.",
            event.threadID,
            event.messageID
          );
        }

        const random =
          members[Math.floor(Math.random() * members.length)];

        targetID = random.id;
        targetName = random.name;
      }

      const sender = await usersData.get(event.senderID);
      const senderName = sender.name;

      if (!targetName) {
        const target = await usersData.get(targetID);
        targetName = target.name;
      }

      const canvas = createCanvas(1536, 791);
      const ctx = canvas.getContext("2d");

      const backgrounds = [
        "https://i.imgur.com/qDCLc3E.jpeg",
        "https://i.imgur.com/gkvKeKj.jpeg",
        "https://i.imgur.com/8ky9MND.jpeg",
        "https://i.imgur.com/sBNpB0Q.jpeg",
        "https://i.imgur.com/HdT9XBS.jpeg",
        "https://i.imgur.com/JT8bpRQ.jpeg"
      ];

      const randomBackground =
        backgrounds[Math.floor(Math.random() * backgrounds.length)];

      const background = await loadImage(randomBackground);

      ctx.drawImage(background, 0, 0, 1536, 791);
      const senderAvatar = `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const targetAvatar = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const thread = await api.getThreadInfo(event.threadID);

      const me = thread.userInfo.find(
        user => user.id == event.senderID
      );

      const myGender =
        me.gender === 2 || me.gender === "FEMALE"
          ? "FEMALE"
          : "MALE";

      let leftAvatar;
      let rightAvatar;

      if (myGender === "MALE") {

        leftAvatar = await loadImage(senderAvatar);
        rightAvatar = await loadImage(targetAvatar);

      } else {

        leftAvatar = await loadImage(targetAvatar);
        rightAvatar = await loadImage(senderAvatar);

      }

      function drawCircle(image, x, y, size) {

        ctx.save();

        ctx.beginPath();

        ctx.arc(
          x + size / 2,
          y + size / 2,
          size / 2,
          0,
          Math.PI * 2
        );

        ctx.closePath();

        ctx.clip();

        ctx.drawImage(image, x, y, size, size);

        ctx.restore();

      }

      drawCircle(leftAvatar, 108, 218, 380);

      drawCircle(rightAvatar, 1061, 218, 380);

      const love = Math.floor(Math.random() * 101);

      ctx.fillStyle = "#FFD700";
      ctx.textAlign = "center";
      ctx.font = "bold 60px Arial";

      ctx.fillText(`${love}%`, 305, 710);

      ctx.fillText(`${love}%`, 1245, 710);

      const output = path.join(__dirname, "pairv3.png");

      const out = fs.createWriteStream(output);

      const stream = canvas.createPNGStream();

      stream.pipe(out);
      out.on("finish", () => {

        let loveText;

        if (love <= 20)
          loveText = "💔 𝓜𝓪𝔂𝓫𝓮 𝓯𝓪𝓽𝓮 𝓱𝓪𝓼 𝓸𝓽𝓱𝓮𝓻 𝓹𝓵𝓪𝓷𝓼.";

        else if (love <= 40)
          loveText = "🤍 𝓖𝓲𝓿𝓮 𝓲𝓽 𝓪 𝓵𝓲𝓽𝓽𝓵𝓮 𝓶𝓸𝓻𝓮 𝓽𝓲𝓶𝓮.";

        else if (love <= 60)
          loveText = "✨ 𝓣𝓱𝓮𝓻𝓮'𝓼 𝓪 𝓰𝓸𝓸𝓭 𝓬𝓸𝓷𝓷𝓮𝓬𝓽𝓲𝓸𝓷.";

        else if (love <= 80)
          loveText = "💖 𝓐 𝓫𝓮𝓪𝓾𝓽𝓲𝓯𝓾𝓵 𝓹𝓪𝓲𝓻.";

        else
          loveText = "💍 𝓐 𝓶𝓪𝓽𝓬𝓱 𝓶𝓪𝓭𝓮 𝓲𝓷 𝓱𝓮𝓪𝓿𝓮𝓷.";

        api.sendMessage(
          {
            body:
`╭─❖ 💞 𝐏𝐀𝐈𝐑 𝐑𝐄𝐒𝐔𝐋𝐓 💞 ❖─╮

💖 𝐏𝐚𝐫𝐭𝐧𝐞𝐫 𝟏
➜ ${senderName}

💖 𝐏𝐚𝐫𝐭𝐧𝐞𝐫 𝟐
➜ ${targetName}

━━━━━━━━━━━━━━

💘 𝐋𝐨𝐯𝐞 𝐌𝐞𝐭𝐞𝐫 :: ${love}%

${loveText}

🌹 𝓣𝓱𝓮 𝓼𝓽𝓪𝓻𝓼 𝓱𝓪𝓿𝓮
𝓹𝓪𝓲𝓻𝓮𝓭 𝔂𝓸𝓾 𝓽𝓸𝓰𝓮𝓽𝓱𝓮𝓻.

╰────────────────╯`,
            attachment: fs.createReadStream(output)
          },
          event.threadID,
          () => {

            api.setMessageReaction("🎀", event.messageID, () => {}, true);

            if (fs.existsSync(output))
              fs.unlinkSync(output);

          },
          event.messageID
        );

      });

    } catch (err) {

      console.error(err);

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      api.sendMessage(
        `❌ Error: ${err.message}`,
        event.threadID,
        event.messageID
      );

    }

  }

};
