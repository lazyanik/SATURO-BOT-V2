const fs = require('fs');

module.exports = {
  config: {
    name: "file",
    aliases: ["givefile"],
    version: "1.2",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 2,
    description: "Extract and send source code of any command file.",
    category: "owner",
    guide: "{pn} [file name]"
  },

  onStart: async function ({ message, args, api, event }) {
    // Safely check for bot admins across different bot architectures without crashing
    let botAdmins = [];
    try {
      botAdmins = global.config?.ADMINBOT || global.client?.ADMINBOT || require('../../config.json').ADMINBOT || [];
    } catch (e) {
      botAdmins = [];
    }

    // If admin list exists and the sender is not an admin, block them
    if (botAdmins.length > 0 && !botAdmins.includes(event.senderID)) {
      return api.sendMessage("❌ You do not have permission to use this command. This command is restricted to bot administrators only.", event.threadID, event.messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("🔰 Please provide a valid file name!", event.threadID, event.messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ File not found: ${fileName}.js`, event.threadID, event.messageID);
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      await api.sendMessage({ body: fileContent }, event.threadID);
    } catch (error) {
      return api.sendMessage(`❌ An error occurred while reading the file: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
