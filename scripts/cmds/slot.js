module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "7.5",
    author: "xalman",
    role: 0,
    countDown: 5,
    category: "GAMES",
    guide: {
      en: "{pn} <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData, api }) => {
    const { senderID, threadID } = event;

    const formatMoney = (num) => {
      const n = Number(num);
      if (n === Infinity || isNaN(n)) return "∞";
      if (n < 1000) return n.toFixed(0);
      const units = [
        { v: 1e12, s: "T" },
        { v: 1e9, s: "B" },
        { v: 1e6, s: "M" },
        { v: 1e3, s: "K" }
      ];
      for (let u of units) {
        if (n >= u.v)
          return (n / u.v).toFixed(2).replace(/\.00$/, "") + u.s;
      }
      return n.toLocaleString();
    };

    function parseAmount(input) {
      if (!input) return NaN;
      let a = input.toLowerCase();
      if (a.endsWith("k")) return parseFloat(a) * 1e3;
      if (a.endsWith("m")) return parseFloat(a) * 1e6;
      if (a.endsWith("b")) return parseFloat(a) * 1e9;
      if (a.endsWith("t")) return parseFloat(a) * 1e12;
      return parseInt(a);
    }

    const betAmount = parseAmount(args[0]);
    const minBet = 100;
    const maxBet = 100000000000;

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(`🎰 Minimum bet is 100$\nExample: /slot 1k`);
    }

    if (betAmount > maxBet) {
      return message.reply(`🚫 Max bet: ${formatMoney(maxBet)}$`);
    }

    let userData = await usersData.get(senderID);
    if (!userData) {
      userData = { money: 0 };
    }
    const currentMoney = Number(userData.money || 0);

    if (betAmount > currentMoney) {
      return message.reply(`💸 Not enough balance!\nBalance: ${formatMoney(currentMoney)}$`);
    }

    if (!global.slotLimit) global.slotLimit = {};
    const now = Date.now();
    if (!global.slotLimit[senderID] || (now - global.slotLimit[senderID].lastReset > 3600000)) {
      global.slotLimit[senderID] = { count: 0, lastReset: now };
    }

    const maxSpins = 100;
    if (global.slotLimit[senderID].count >= maxSpins) {
      return message.reply(`🚫 Daily limit reached (${maxSpins} spins)`);
    }

    const items = ["🍎","🍐","🍑","🍒","🍓","🍇","🍉","🍊","🍋","🍌","🍍","🥭"];
    let s = [];

    const winRoll = Math.random() * 100;
    let forceMatch = 0;

    if (winRoll <= 10) forceMatch = 4;
    else if (winRoll <= 25) forceMatch = 3;
    else if (winRoll <= 45) forceMatch = 2;

    if (forceMatch > 0) {
      const luckyItem = items[Math.floor(Math.random() * items.length)];
      s = Array(4).fill(null).map((_, i) =>
        i < forceMatch ? luckyItem : items[Math.floor(Math.random() * items.length)]
      );
      s = s.sort(() => Math.random() - 0.5);
    } else {
      s = Array.from({ length: 4 }, () =>
        items[Math.floor(Math.random() * items.length)]
      );
    }

    global.slotLimit[senderID].count++;

    const sent = await message.reply(
      `🎰 | SLOT MACHINE\n──────────────\n [ ❓ | ❓ | ❓ | ❓ ]\n──────────────\n⌛ Spinning...`
    );

    await new Promise(r => setTimeout(r, 1000));

    await api.editMessage(
      `🎰 | SLOT MACHINE\n──────────────\n [ ${s[0]} | ${s[1]} | ❓ | ❓ ]\n──────────────\n⌛ Spinning...`,
      sent.messageID
    );

    await new Promise(r => setTimeout(r, 1000));

    const counts = {};
    s.forEach(i => counts[i] = (counts[i] || 0) + 1);
    const maxMatch = Math.max(...Object.values(counts));

    const win = maxMatch >= 2;

    let multiplier = 0;
    if (maxMatch === 4) multiplier = 4;
    else if (maxMatch === 3) multiplier = 2;
    else if (maxMatch === 2) multiplier = 1;

    const bonus = win ? betAmount * multiplier : 0;
    const finalMoney = win ? currentMoney + bonus : currentMoney - betAmount;

    userData.money = finalMoney;
    await usersData.set(senderID, userData);

    const status = win ? `WIN ${multiplier}x 🎉` : "LOSE ❤️‍🩹";
    const resultMessage = `🎰 | SLOT MACHINE\n──────────────\n [ ${s.join(" | ")} ]\n──────────────\n📢 ${status}\n💰 ${win ? "Won: " + formatMoney(bonus) : "Lost: " + formatMoney(betAmount)}$\n💳 Balance: ${formatMoney(finalMoney)}$\n📜 Usage: ${global.slotLimit[senderID].count}/${maxSpins}`;

    await api.editMessage(resultMessage, sent.messageID);
  }
};
