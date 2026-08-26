const faces = {
  1: "⚀",
  2: "⚁",
  3: "⚂",
  4: "⚃",
  5: "⚄",
  6: "⚅"
};

module.exports = {
  config: {
    name: "dice",
    aliases: ["roll"],
    version: "1.0",
    author: "Toshiro Editz",
    countDown: 5,
    role: 0,
    shortDescription: "Guess the dice number",
    category: "game",
    guide: "{pn} <1-6> <amount>"
  },

  onStart: async function ({ api, event, usersData, args }) {
    try {
      const guess = parseInt(args[0]);
      const amount = parseInt(args[1]);

      if (isNaN(guess) || guess < 1 || guess > 6 || isNaN(amount) || amount <= 0) {
        return api.sendMessage("❌ Usage: dice <1-6> <amount>", event.threadID);
      }

      const user = await usersData.get(event.senderID);
      if (user.money < amount) {
        return api.sendMessage(`❌ Insufficient balance! You have ${user.money} coins.`, event.threadID);
      }

      await usersData.subtractMoney(event.senderID, amount);

      const diceValue = Math.floor(Math.random() * 6) + 1;
      const diceEmoji = faces[diceValue];
      const win = guess === diceValue;
      const reward = win ? amount * 6 : 0;

      if (win) {
        await usersData.addMoney(event.senderID, reward);
      }

      const newUser = await usersData.get(event.senderID);

      return api.sendMessage(
`━━━━━━━━━━━━━━━━━━
🎲 DICE ROLL
━━━━━━━━━━━━━━━━━━
Your Guess  : ${faces[guess]} (${guess})
Dice Result : ${diceEmoji} (${diceValue})

Status      : ${win ? "🎉 PERFECT MATCH (6x)!" : "❌ LOSE"}
Reward      : +${reward} Coins
New Balance : ${newUser.money} Coins
━━━━━━━━━━━━━━━━━━`,
        event.threadID
      );
    } catch (err) {
      console.error("Dice Error:", err);
      return api.sendMessage("❌ Dice game failed.", event.threadID);
    }
  }
};
