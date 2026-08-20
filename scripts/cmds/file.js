const fs = require('fs');

module.exports = {
  config: {
    name: "givefile",
    aliases: ["file"],
    version: "1.0",
    author: "FAHAD",
    countDown: 5,
    role: 0,
    description: "extract file",
    category: "owner",
    guide: "{pn} Write a file name"
  },

  onStart: async function ({ message, args, api, event }) {
    const permission = ["61590594545013", ""];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("Guu kha tor file neoar kono permission nai 🙂🐸", event.threadID, event.messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("🔰 provide a file name!", event.threadID, event.messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`File not found: ${fileName}.js`, event.threadID, event.messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    api.sendMessage({ body: fileContent }, event.threadID);
  }
};
