module.exports = {
  config: {
    name: "top",
    aliases: ["richlist"],
    version: "1.2",
    author: "xnil6x",
    shortDescription: "💰 Top Money Leaderboard",
    longDescription: "🏆 Displays users with highest balances in K/M/B/T/QT format",
    category: "Economy",
    guide: {
      en: "{p}top [number]"
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    try {
      const allUsers = await usersData.getAll();
      
      const topCount = args[0] ? Math.min(parseInt(args[0]), 20) : 10;
      
      const topUsers = allUsers
        .filter(user => user.money !== undefined)
        .sort((a, b) => b.money - a.money)
        .slice(0, topCount);

      if (topUsers.length === 0) {
        return api.sendMessage("❌ No users with money data found!", event.threadID);
      }

      let leaderboardMsg = `🏆 𝗧𝗢𝗣 ${topCount} 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦\n━━━━━━━━━━━━━━━━━━\n\n`;
      
      topUsers.forEach((user, index) => {
        const rank = index + 1;
        const name = user.name || "Unknown User";
        const money = formatMoney(user.money || 0);
        
        leaderboardMsg += `${getRankEmoji(rank)} 𝗥𝗮𝗻𝗄 ${rank}: ${name}\n💰 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${money}\n\n`;
      });

      leaderboardMsg += `━━━━━━━━━━━━━━━━━━\n💡 Use {p}top 5 for top 5 or {p}top 20 for top 20`;

      api.sendMessage(leaderboardMsg, event.threadID);

    } catch (error) {
      console.error("❌ Top Command Error:", error);
      api.sendMessage("⚠️ Failed to fetch leaderboard. Please try again later.", event.threadID);
    }
  }
};

function getRankEmoji(rank) {
  const emojis = ["👑","🥈","🥉","🔷","🔶","⭐","✨","▪️"];
  if (rank === 1) return emojis[0];
  if (rank === 2) return emojis[1];
  if (rank === 3) return emojis[2];
  if (rank <= 5) return emojis[3];
  if (rank <= 10) return emojis[4];
  if (rank <= 15) return emojis[5];
  return emojis[6];
}

function formatMoney(amount) {
  if (amount >= 1000000000000000) {
    return (amount / 1000000000000000).toFixed(2) + "QT";
  }
  if (amount >= 1000000000000) {
    return (amount / 1000000000000).toFixed(2) + "T";
  }
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(2) + "B";
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2) + "M";
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(2) + "K";
  }
  return amount.toString();
  }
