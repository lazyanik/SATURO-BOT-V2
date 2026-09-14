module.exports = {
  config: {
    name: "stats",
    aliases: ["dbstatus", "dbs"],
    version: "1.0.4",
    author: "Anik Islam Sadik",
    role: 2,
    category: "Admin",
    shortDescription: "Check MongoDB status with stylish report",
    guide: "{p}stats",
    cooldowns: 5
  },

  onStart: async function({ api, event }) {
    const { threadID, messageID } = event;
    
    try {
      await api.setMessageReaction("⏳", messageID, (err) => {}, true);
      
      const mongoose = require("mongoose");
      
      if (mongoose.connection.readyState !== 1) {
        await api.setMessageReaction("❌", messageID, (err) => {}, true);
        return api.sendMessage("❌ 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲 𝗶𝘀 𝗻𝗼𝘁 𝗰𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱!", threadID, messageID);
      }

      const admin = mongoose.connection.db.admin();
      const status = await admin.command({ serverStatus: 1 });
      
      const uptimeSec = status.uptime;
      const d = Math.floor(uptimeSec / (3600 * 24));
      const h = Math.floor((uptimeSec % (3600 * 24)) / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = Math.floor(uptimeSec % 60);
      const uptimeStr = `${d}d ${h}h ${m}m ${s}s`;

      const version = status.version;
      const memory = status.mem.resident;

      const currentConnections = status.connections.current;
      const availableConnections = status.connections.available;
      const totalCreated = status.connections.totalCreated;

      const queries = status.opcounters.query;
      const inserts = status.opcounters.insert;
      const updates = status.opcounters.update;

      const responseText = 
        `╭━━━〔 ✦ 𝗗𝗕 𝗠𝗢𝗡𝗜𝗧𝗢𝗥 ✦ 〕━━━╮\n` +
        `┃\n` +
        `┃  ● STATUS   :  ONLINE\n` +
        `┃  ● UPTIME   : ${uptimeStr}\n` +
        `┃  ● VERSION  : ${version}\n` +
        `┃  ● MEMORY   : ${memory} MB\n` +
        `┃\n` +
        `┣━━〔 ✧ 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗢𝗡𝗦 ✧〕━━━━┫\n` +
        `┃  😸 Active    → ${currentConnections}\n` +
        `┃  👨‍💻 Available → ${availableConnections}\n` +
        `┃  📜 Total     → ${totalCreated}\n` +
        `┃\n` +
        `┣━━〔 📊 𝗦𝗬𝗦𝗧𝗘𝗠 〕━━━━━┫\n` +
        `┃  🔍 Query  → ${queries}\n` +
        `┃  📥 Insert → ${inserts}\n` +
        `┃  🔄 Update → ${updates}\n` +
        `┃\n` +
        `╰━━━━━━〔 ♡ 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘  ♡ 〕━━━━━━╯`;

      await api.sendMessage(responseText, threadID, messageID);
      await api.setMessageReaction("✅", messageID, (err) => {}, true);

    } catch (error) {
      console.error("DBStatus Error:", error);
      await api.setMessageReaction("❌", messageID, (err) => {}, true);
      return api.sendMessage(`⚠️ 𝗘𝗿𝗿𝗼𝗿: ${error.message}`, threadID, messageID);
    }
  }
};
