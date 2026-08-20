const fs = require("fs-extra");
const { utils } = global;
 
module.exports = {
  config: {
    name: "prefix",
    version: "1.9",
    author: "NTKhang | Modified by Mohammad Alamin",
    countDown: 5,
    role: 0,
    description: "View or change bot prefix (for chat or globally)",
    category: "⚙ Configuration",
    guide: {
      en:
        "┌─『 Prefix Settings 』─┐\n" +
        "│ 🔹 {pn} <prefix>\n" +
        "│ 🔹 {pn} <prefix> -g\n" +
        "│ 🔹 {pn} reset\n" +
        "└──────────────────────┘"
    }
  },
 
  langs: {
    en: {
      reset: "✅ Reset to default: %1",
      onlyAdmin: "⛔ Only bot admins can change the global prefix!",
      confirmGlobal: "⚙ React to confirm global prefix update.",
      confirmThisThread: "⚙ React to confirm this chat's prefix update.",
      successGlobal: `✅ Global prefix changed to: %1`,
      successThisThread: `✅ Chat prefix changed to: %1`
    }
  },
 
  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();
 
    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }
 
    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };
 
    if (formSet.setGlobal && role < 2) {
      return message.reply(getLang("onlyAdmin"));
    }
 
    const confirmMessage = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");
    return message.reply(confirmMessage, (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },
 
  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;
 
    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    }
 
    await threadsData.set(event.threadID, newPrefix, "data.prefix");
    return message.reply(getLang("successThisThread", newPrefix));
  },
 
  onChat: async function ({ event, message, threadsData, usersData }) {

    const videoUrl = "https://files.catbox.moe/5ygqm3.mp4";
 
    const globalPrefix = global.GoatBot.config.prefix;
    const threadPrefix = (await threadsData.get(event.threadID, "data.prefix")) || globalPrefix;
 
    if (event.body && event.body.toLowerCase() === "prefix") {
      const userName = await usersData.getName(event.senderID);
 
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Dhaka"
      });
 
      return message.reply({
        body:
`🌐 𝐆𝐥𝐨𝐛𝐚𝐥 𝐩𝐫𝐞𝐟𝐢𝐱: ${globalPrefix}
👨‍💻 𝐘𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩 𝐩𝐫𝐞𝐟𝐢𝐱: ${threadPrefix}
 
╭‣ 𝐀𝐝𝐦𝐢𝐧 👑
╰‣  🦋 ꫝɴ֟፝ɪᴋ ɪꜱʟꫝᴍ 𝚂ꫝᴅɪᴋ ♡
 
╭‣ 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 ⓕ
╰‣ m.facebook.com/anik.islam.sadik`,
        attachment: await global.utils.getStreamFromURL(videoUrl)
      });
    }
  }
};
