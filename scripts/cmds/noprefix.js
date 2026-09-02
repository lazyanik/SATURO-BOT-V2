const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "noprefix",
    aliases: ["nopfx"],
    version: "1.0",
    author: "Neoaz 🐊",
    countDown: 5,
    role: 2,
    description: {
      en: "Toggle no-prefix mode - lets Bot Admins and Developers run commands without the prefix"
    },
    category: "owner",
    guide: {
      en: '{pn} on: Enable no-prefix mode\n' +
        '{pn} off: Disable no-prefix mode\n' +
        '{pn} status: View current no-prefix status'
    }
  },

  onStart: async function ({ message, args }) {
    const saveConfig = () => {
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
    };

    const sub = (args[0] || "").toLowerCase();

    switch (sub) {
      case "on":
      case "enable": {
        config.noPrefix = true;
        saveConfig();
        return message.reply("✅ | No-prefix mode ENABLED.\nBot Admins (role 2) and Developers (role 4) can now run commands without the prefix.");
      }

      case "off":
      case "disable": {
        config.noPrefix = false;
        saveConfig();
        return message.reply("✅ | No-prefix mode DISABLED.\nEveryone must use the prefix again.");
      }

      case "status":
      case "info":
      case "": {
        return message.reply(`📊 | No-prefix mode is currently ${config.noPrefix ? "ON" : "OFF"}.`);
      }

      default:
        return message.reply("⚠️ | Invalid subcommand. Use: on, off, or status");
    }
  }
};
