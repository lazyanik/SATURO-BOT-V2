const fs = require("fs-extra");

module.exports = {
  config: {
    name: "rm",
    aliases: ["rmirror", "mirrorreact"],
    version: "3.1",
    author: "Toshiro Editz",
    countDown: 5,
    role: { onStart: 2, onChat: 0, onReaction: 0 },
    shortDescription: { en: "Mirror admin reactions" },
    longDescription: { en: "If a bot admin reacts, bot will react same" },
    category: "owner",
    guide: { en: " {pn} on/off" }
  },

  langs: {
    en: {
      turnedOn: "✅ 𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡 𝗠𝗜𝗥𝗢𝗥: 𝗢𝗡",
      turnedOff: "🚫 𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡 𝗠𝗜𝗥𝗢𝗥: 𝗢𝗙",
      status: "🪞 𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡 𝗠𝗜𝗥𝗢𝗥\n• Status : %1"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    const { config } = global.GoatBot;
    const { client } = global;
    if (!config.reactionMirror) config.reactionMirror = { enable: true };

    const sub = (args[0] || "").toLowerCase();
    if (sub === "on") {
      config.reactionMirror.enable = true;
      fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
      return message.reply(getLang("turnedOn"));
    }
    if (sub === "off") {
      config.reactionMirror.enable = false;
      fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
      return message.reply(getLang("turnedOff"));
    }
    const isOn = config.reactionMirror.enable!== false;
    return message.reply(getLang("status", isOn? "ON ✅" : "OFF 🚫"));
  },

  onChat: async function () {}, // lagbe na

  onReaction: async function ({ api, event }) {
    const { config } = global.GoatBot;
    if (config.reactionMirror?.enable === false) return;
    if (!event.reaction) return;

    const botID = api.getCurrentUserID();
    const reactorID = event.senderID || event.userID; // fix

    if (reactorID == botID) return;

    const adminBot = config.adminBot || [];
    if (!adminBot.includes(String(reactorID))) return;

    try {
      // 3rd parameter callback, 4th remove = false
      await api.setMessageReaction(event.reaction, event.messageID, (err) => {
        if(err) console.log(err)
      }, false);
    } catch (e) {
      console.log("RMirror Error:", e);
    }
  }
};
