const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: 'pair4',
    aliases: ['pr4','pair 4'],
    version: '1.0',
    author: 'Mueid Mursalin Rifat',
    countDown: 5,
    role: 0,
    shortDescription: 'Pair With you Soulmate',
    longDescription: 'Pair With you Love reply/tag Or Random',
    category: 'media',
    guide: {
      en: '{p}pair or reply/tag'
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    try {
      let targetUserID;
      let targetUserName;
      
      // Check if user is replying to a message or tagging someone
      if (event.type === "message_reply") {
        targetUserID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        targetUserID = Object.keys(event.mentions)[0];
      } else {
        // Random pairing from group members
        const threadData = await api.getThreadInfo(event.threadID);
        const users = threadData.userInfo;
        
        // Filter out the sender
        const otherUsers = users.filter(user => user.id !== event.senderID);
        
        if (otherUsers.length === 0) {
          return api.sendMessage("❌ No other users in the group to pair with!", event.threadID, event.messageID);
        }
        
        // Randomly select a user
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        targetUserID = randomUser.id;
        targetUserName = randomUser.name;
      }
      
      // Get sender's data
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData.name;
      
      // If targetUserName is not set yet (for reply/tag), get it
      if (!targetUserName) {
        const targetData = await usersData.get(targetUserID);
        targetUserName = targetData.name;
      }
      
      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ✅ Select random background from the three options
      const backgroundUrls = [
        "https://files.catbox.moe/jtv65q.png",
        "https://files.catbox.moe/pzya3s.png",
        "https://files.catbox.moe/e08jbf.png"
      ];
      const randomBg = backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)];
      
      const background = await loadImage(randomBg);
      ctx.drawImage(background, 0, 0, width, height);

      // Load profile pictures
      const sIdImage = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const pairPersonImage = await loadImage(
        `https://graph.facebook.com/${targetUserID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      // Draw circular avatars
      function drawCircle(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircle(ctx, sIdImage, 385, 40, 170);
      drawCircle(ctx, pairPersonImage, width - 213, 190, 170);

      // Save to file
      const outputPath = path.join(__dirname, "pair_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 101); // 0-100%
        
        // Different messages based on love percentage
        let loveMessage;
        if (lovePercent <= 20) {
          loveMessage = "💔 𝘖𝘩 𝘯𝘰! 𝘕𝘰𝘵 𝘢 𝘨𝘰𝘰𝘥 𝘮𝘢𝘵𝘤𝘩...";
        } else if (lovePercent <= 40) {
          loveMessage = "🤔 𝘔𝘢𝘺𝘣𝘦 𝘯𝘦𝘦𝘥 𝘮𝘰𝘳𝘦 𝘵𝘪𝘮𝘦 𝘵𝘰𝘨𝘦𝘵𝘩𝘦𝘳?";
        } else if (lovePercent <= 60) {
          loveMessage = "✨ 𝘎𝘰𝘰𝘥 𝘱𝘰𝘵𝘦𝘯𝘵𝘪𝘢𝘭 𝘩𝘦𝘳𝘦!";
        } else if (lovePercent <= 80) {
          loveMessage = "💖 𝘈𝘸𝘸, 𝘵𝘩𝘢𝘵'𝘴 𝘴𝘰 𝘴𝘸𝘦𝘦𝘵!";
        } else {
          loveMessage = "😍 𝘗𝘌𝘙𝘍𝘌𝘊𝘛 𝘔𝘈𝘛𝘊𝘏! 𝘚𝘰𝘶𝘭𝘮𝘢𝘵𝘦𝘴!";
        }

        const message = `💘 𝗖𝗼𝘂𝗽𝗹𝗲 𝗔𝗹𝗲𝗿𝘁 💘

🖤 𝘗𝘢𝘪𝘳:
• ${senderName}
• ${targetUserName}

💞 𝘓𝘰𝘷𝘦 𝘔𝘦𝘵𝘦𝘳: ${lovePercent}%
${loveMessage}

🌸 𝘏𝘰𝘱𝘦 𝘺𝘰𝘶 𝘵𝘸𝘰 𝘩𝘢𝘷𝘦 𝘣𝘦𝘢𝘶𝘵𝘪𝘧𝘶𝘭 𝘮𝘰𝘮𝘦𝘯𝘵𝘴!`;

        api.sendMessage(
          {
            body: message,
            attachment: fs.createReadStream(outputPath),
          },
          event.threadID,
          () => {
            fs.unlinkSync(outputPath);
          },
          event.messageID
        );
      });
    } catch (error) {
      api.sendMessage(
        "❌ An error occurred while trying to find a match.\n" + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
