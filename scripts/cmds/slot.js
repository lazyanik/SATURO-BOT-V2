const symbols = ["🍒", "🍋", "🍇", "🍉", "⭐", "💎"];

const randomSymbol = () =>
  symbols[Math.floor(Math.random() * symbols.length)];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "2.0",
    author: "Toshiro Editz",
    countDown: 10,
    role: 0,
    shortDescription: "Spin a free slot",
    category: "game",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const sent = await api.sendMessage(
`━━━━━━━━━━━━━━━━━━
🎰 Slot Machine
━━━━━━━━━━━━━━━━━━
      🎰  🎰  🎰

🔄 Spinning...
━━━━━━━━━━━━━━━━━━`,
        event.threadID
      );

      const messageID = sent.messageID || sent;

      await sleep(800);

      await api.editMessage(
`━━━━━━━━━━━━━━━━━━
🎰 Slot Machine
━━━━━━━━━━━━━━━━━━
      ${randomSymbol()}  🎰  🎰

🔄 Spinning...
━━━━━━━━━━━━━━━━━━`,
        messageID
      );

      await sleep(800);

      await api.editMessage(
`━━━━━━━━━━━━━━━━━━
🎰 Slot Machine
━━━━━━━━━━━━━━━━━━
      ${randomSymbol()}  ${randomSymbol()}  🎰

🔄 Almost done...
━━━━━━━━━━━━━━━━━━`,
        messageID
      );

      await sleep(1000);

      const a = randomSymbol();
      const b = randomSymbol();
      const c = randomSymbol();

      let reward = 0;
      let result = "😔 No Match";

      if (a === b && b === c) {
        reward = a === "💎" ? 1000 : 500;
        result = a === "💎"
          ? "💎 JACKPOT!"
          : "🎉 TRIPLE MATCH!";
      } else if (a === b || b === c || a === c) {
        reward = 150;
        result = "✨ DOUBLE MATCH!";
      }

      if (reward > 0) {
        await usersData.addMoney(event.senderID, reward);
      }

      const user = await usersData.get(event.senderID);

      await api.editMessage(
`━━━━━━━━━━━━━━━━━━
🎰 Slot Machine
━━━━━━━━━━━━━━━━━━
      ${a}  ${b}  ${c}

${result}
💰 Reward  : +${reward} Coins
💳 Balance : ${user.money} Coins
━━━━━━━━━━━━━━━━━━`,
        messageID
      );

    } catch (err) {
      console.error("Slot Error:", err);
      return api.sendMessage(
        "❌ Slot game failed.",
        event.threadID
      );
    }
  }
};
