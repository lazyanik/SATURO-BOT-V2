const pidusage = require("pidusage");
const si = require("systeminformation");

module.exports = {
  config: {
    name: "uptime3",
    aliases: ["up3"],
    version: "1.2",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: "system uptime",
    longDescription: "Fast boot → dashboard with CPU, owner, and GC count",
    category: "system"
  },

  onStart: async function ({ api, event }) {
    const delay = ms => new Promise(res => setTimeout(res, ms));

    const loadStages = [
      "[ █🗂️░░░░░░░░░░░░░░ ] 10%",
      "[ █████🗂️░░░░░░░░░ ] 30%",
      "[ █████████🗂️░░░░ ] 60%",
      "[ █████████████✅ ] 80%",
      "[ ███████████████ ] 100%"
    ];

    const loading = await api.sendMessage(
      "SATURO BOT System...⏳\n" + loadStages[0],
      event.threadID
    );
    const msgID = loading.messageID;

    for (let i = 1; i < loadStages.length; i++) {
      await delay(400);
      try {
        await api.editMessage(
          "SATURO BOT System ✅\n" + loadStages[i],
          msgID
        );
      } catch (e) {
        break;
      }
    }

    let gcCount = 0;
    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      gcCount = threads.filter(t => t.isGroup).length;
    } catch {}

    const buildPanel = async () => {
      const uptime = process.uptime();
      const d = Math.floor(uptime / 86400);
      const h = Math.floor((uptime % 86400) / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);

      const mem = await si.mem();
      const load = await pidusage(process.pid);
      const cpu = await si.cpu();

      const now = new Date();
      const date = now.toLocaleDateString("en-US");
      const time = now.toLocaleTimeString("en-US", { hour12: false });

      return `
╔═════════════════════╗
║   ⚡ SATURO BOT SYSTEM ⚡
╠═════════════════════╣
║ ⏳ Uptime   : ${d}d ${h}h ${m}m ${s}s
║ 📅 Date     : ${date}
║ 🕒 Time     : ${time}
║
║ 🔥 CPU Load : ${load.cpu.toFixed(1)}%
║ 🧩 CPU Cores: ${cpu.cores}
║ 🧵 Threads  : ${cpu.processors}
║ 💾 RAM Used : ${(mem.used / 1024 ** 3).toFixed(2)} GB
║ 💾 RAM Total: ${(mem.total / 1024 ** 3).toFixed(2)} GB
║ 👥 Group Chats : ${gcCount}
║
║ ⚙️ PID      : ${process.pid}
║ 🛠 Node.js  : ${process.version}
║ 🧘‍♂️ Owner   : Anik Islam Sadik
╠═════════════════════╣
║        ✅ SYSTEM RUNNING
╚═════════════════════╝
`;
    };

    const panel = await buildPanel();
    try {
      await api.editMessage(panel, msgID);
    } catch {}

    const MAX_UPDATES = 24;
    let updateCount = 0;
    const intervalID = setInterval(async () => {
      updateCount++;
      if (updateCount > MAX_UPDATES) {
        clearInterval(intervalID);
        try {
          await api.editMessage(
            panel.replace("✅ SYSTEM RUNNING", "⏹ AUTO-UPDATE STOPPED"),
            msgID
          );
        } catch {}
        return;
      }
      try {
        const update = await buildPanel();
        await api.editMessage(update, msgID);
      } catch {
        clearInterval(intervalID);
      }
    }, 5000);
  }
};
