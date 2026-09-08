const axios = require("axios");

module.exports = {
  config: {
    name: "ffquiz",
    aliases: ["ffqz"],
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    category: "GAMES",
    description: "🎮 Free Fire Quiz"
  },

  onStart: async function({ api, event, usersData }) {
    try {
      if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();

      const response = await axios.get("https://azadx69x-all-apis-top.vercel.app/api/ffquiz");
      const q = response.data.quiz;

      const options = {
        A: q.options[0].replace(/^A\.?\s*/, ""),
        B: q.options[1].replace(/^B\.?\s*/, ""),
        C: q.options[2].replace(/^C\.?\s*/, ""),
        D: q.options[3].replace(/^D\.?\s*/, "")
      };

      const quizMsg = `🔥➤ 𝐅𝐅 𝐐𝐔𝐈𝐙 🔥
❓ ${q.question}

🅰️ 𝐀) ${options.A}
🅱️ 𝐁) ${options.B}
🅾️ 𝐂) ${options.C}
🅳️ 𝐃) ${options.D}

⏰ 𝐇𝐮𝐫𝐫𝐲! 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐀, 𝐁, 𝐂 or 𝐃`;

      const msg = await api.sendMessage(quizMsg, event.threadID, event.messageID);

      global.GoatBot.onReply.set(msg.messageID, {
        type: "reply",
        commandName: this.config.name,
        author: event.senderID,
        messageID: msg.messageID,
        correctAnswer: q.answer.toUpperCase()
      });

      setTimeout(() => {
        try { api.unsendMessage(msg.messageID); } catch {}
        global.GoatBot.onReply.delete(msg.messageID);
      }, 60000);

    } catch (error) {
      if (error.response && error.response.status === 429) {
        api.sendMessage("⚠️ 𝐒𝐞𝐫𝐯𝐞𝐫 𝐛𝐮𝐬𝐲, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 𝐚 𝐟𝐞𝐰 𝐬𝐞𝐜𝐨𝐧𝐝𝐬 𝐚𝐧𝐝 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.", event.threadID, event.messageID);
      } else {
        api.sendMessage(`❌ 𝐄𝐫𝐫𝐨𝐫: ${error.message}`, event.threadID, event.messageID);
      }
    }
  },

  onReply: async function({ api, event, Reply, usersData }) {
    if (!Reply) return;

    const { correctAnswer, author } = Reply;

    if (event.senderID !== author)
      return api.sendMessage("🐸 𝐄𝐢 𝐪𝐮𝐢𝐳 𝐭𝐦𝐫 𝐧𝐚, 𝐜𝐡𝐮𝐝𝐥𝐢𝐧𝐠 𝐩𝐨𝐧𝐠!", event.threadID, event.messageID);

    const userReply = event.body.trim().toUpperCase();

    if (!["A","B","C","D"].includes(userReply))
      return api.sendMessage("❌ 𝐑𝐞𝐩𝐥𝐲 𝐨𝐧𝐥𝐲 𝐀, 𝐁, 𝐂 𝐨𝐫 𝐃!", event.threadID, event.messageID);

    const userData = await usersData.get(author);
    const rewardCoins = 500;
    const rewardExp = 121;

    try { await api.unsendMessage(Reply.messageID); } catch {}
    global.GoatBot.onReply.delete(Reply.messageID);

    if (userReply === correctAnswer.toUpperCase()) {
      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data
      });

      return api.sendMessage(
        `✅ 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐀𝐧𝐬𝐰𝐞𝐫!
🎁 +${rewardCoins} 𝐂𝐨𝐢𝐧𝐬
⭐ +${rewardExp} 𝐄𝐗𝐏`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `❌ 𝐖𝐫𝐨𝐧𝐠 𝐀𝐧𝐬𝐰𝐞𝐫!
✔ 𝐑𝐢𝐠𝐡𝐭 𝐀𝐧𝐬𝐰𝐞𝐫: ${correctAnswer.toUpperCase()}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
