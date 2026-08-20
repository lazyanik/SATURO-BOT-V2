const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const mediaUrls = [
  "https://i.imgur.com/U052kne.gif"
];

module.exports = {
  config: {
    name: "help",
    aliases: ["h"],
    version: "1.27",
    author: "Toshiro Editz",
    countDown: 5,
    role: 0,

    shortDescription: {
      en: "Explore command usage 📖"
    },

    longDescription: {
      en: "View detailed command usage, list commands by page, or filter commands by category ✨"
    },

    category: "info",

    guide: {
      en: "{pn} [page]\n{pn} [command]\n{pn} -c <category>"
    },

    priority: 1
  },

  onStart: async function ({ message, args, event }) {
    try {
      const { threadID } = event;
      const prefix = getPrefix(threadID) || "!";

      const getAttachment = async () => {
        try {
          const randomUrl =
            mediaUrls[Math.floor(Math.random() * mediaUrls.length)];

          const response = await axios({
            method: "GET",
            url: randomUrl,
            responseType: "stream",
            timeout: 30000,
            maxRedirects: 5,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36",
              Accept: "*/*",
              Referer: "https://imgur.com/"
            }
          });

          console.log("Media Status:", response.status);
          console.log("Content-Type:", response.headers["content-type"]);

          return response.data;
        } catch (err) {
          console.error("Attachment Error:");
          console.error("Status:", err.response?.status);
          console.error("Message:", err.message);
          return null;
        }
      };

      if (args.length === 0 || !isNaN(args[0])) {
        const categories = {};
        const commandList = [];

        for (const [name, value] of commands) {
          if (!value?.config) continue;

          const category = String(
            value.config.category || "uncategorized"
          )
            .toLowerCase()
            .trim();

          if (!categories[category]) {
            categories[category] = [];
          }

          const commandName = value.config.name || name;

          categories[category].push(commandName);
          commandList.push(commandName);
        }

        for (const category of Object.keys(categories)) {
          categories[category] = [
            ...new Set(categories[category])
          ].sort((a, b) => a.localeCompare(b));
        }

        const totalCommands = [
          ...new Set(commandList)
        ].length;

        const sortedCategories = Object.keys(categories).sort();

        const page = parseInt(args[0]) || 1;
        const itemsPerPage = 10;

        const totalPages = Math.max(
          1,
          Math.ceil(sortedCategories.length / itemsPerPage)
        );

        if (page < 1 || page > totalPages) {
          return message.reply(
            `🚫 Invalid page!\nPlease choose between 1 and ${totalPages}.`
          );
        }

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const pagedCategories = sortedCategories.slice(
          start,
          end
        );

        let msg =
          `✨ [ Guide For Beginners - Page ${page} ] ✨\n\n`;

        for (const category of pagedCategories) {
          const cmds = categories[category];

          msg += `╒══════[ ${category.toUpperCase()} ]\n`;
          msg += `╞》 ${cmds.join(" ♡ ")}\n`;
          msg += `╘══════════════════╛\n`;
        }

        msg += `\n╭‣『 ALYA BOT 』\n`;
        msg += `╰‣ Total Commands: ${totalCommands}\n`;
        msg += `╭‣ Page ${page}/${totalPages}\n`;
        msg += `╰‣ Prefix: ${prefix}\n`;
        msg += `╭‣ Admin: ꫝɴ֟፝ɪᴋ ɪsʟꫝᴍ ѕꫝᴅɪᴋ\n`;
        msg += `╰‣ Type ${prefix}help <command> for details`;

        return message.reply({
          body: msg,
          attachment: await getAttachment()
        });
      }

      if (
        args[0] &&
        args[0].toLowerCase().trim() === "-c"
      ) {
        if (!args[1]) {
          return message.reply(
            `🚫 Please specify a category!\n\n` +
            `Example:\n` +
            `${prefix}help -c fun`
          );
        }

        const categoryName = args
          .slice(1)
          .join(" ")
          .toLowerCase()
          .trim();

        const filteredCommands = [];

        for (const [name, command] of commands) {
          if (!command?.config) continue;

          const commandCategory = String(
            command.config.category || "uncategorized"
          )
            .toLowerCase()
            .trim();

          if (commandCategory === categoryName) {
            const commandName =
              command.config.name || name;

            if (
              commandName &&
              !filteredCommands.includes(commandName)
            ) {
              filteredCommands.push(commandName);
            }
          }
        }

        if (!filteredCommands.length) {
          const availableCategories = [
            ...new Set(
              Array.from(commands.values())
                .filter(cmd => cmd?.config)
                .map(cmd =>
                  String(
                    cmd.config.category ||
                      "uncategorized"
                  )
                    .toLowerCase()
                    .trim()
                )
                .filter(Boolean)
            )
          ].sort();

          let errorMsg =
            `🚫 No commands found in "${categoryName}" category.\n\n`;

          errorMsg += `📂 Available Categories:\n`;
          errorMsg += `╒══════════════════╕\n`;
          errorMsg += `╞》 ${availableCategories.join(" ♡ ")}\n`;
          errorMsg += `╘══════════════════╛`;

          return message.reply(errorMsg);
        }

        filteredCommands.sort((a, b) =>
          a.localeCompare(b)
        );

        let msg =
          `✨ [ ${categoryName.toUpperCase()} COMMANDS ] ✨\n\n`;

        msg += `╒══════[ ${categoryName.toUpperCase()} ]\n`;
        msg += `╞》 ${filteredCommands.join(" ♡ ")}\n`;
        msg += `╘══════════════════╛\n\n`;

        msg += `╭‣ 📂 Category: ${categoryName}\n`;
        msg += `├‣ 📌 Total: ${filteredCommands.length}\n`;
        msg += `╰‣ ⚡ Prefix: ${prefix}`;

        return message.reply({
          body: msg,
          attachment: await getAttachment()
        });
      }

      const commandName = args[0]
        .toLowerCase()
        .trim();

      let command = commands.get(commandName);

      if (!command && aliases) {
        const aliasTarget = aliases.get(commandName);

        if (aliasTarget) {
          command = commands.get(aliasTarget);
        }
      }

      if (!command) {
        return message.reply(
          `❌ Command "${commandName}" not found.\n\n` +
          `Use ${prefix}help to see all commands.`
        );
      }

      const configCommand = command.config;

      const guide =
        configCommand.guide?.en ||
        "No guide available.";

      const usage = guide
        .replace(/{pn}/g, prefix)
        .replace(/{n}/g, configCommand.name);

      let commandAliases = "None";

      if (
        Array.isArray(configCommand.aliases) &&
        configCommand.aliases.length
      ) {
        commandAliases =
          configCommand.aliases.join(", ");
      } else if (aliases) {
        const foundAliases = [];

        for (const [alias, target] of aliases) {
          if (
            target === configCommand.name &&
            !foundAliases.includes(alias)
          ) {
            foundAliases.push(alias);
          }
        }

        if (foundAliases.length) {
          commandAliases =
            foundAliases.join(", ");
        }
      }

      let msg =
        `✨ [ ${configCommand.name.toUpperCase()} ] ✨\n\n`;

      msg += `╭─── 📜 INFORMATION ───╮\n`;
      msg += `│ 🏷 Name: ${configCommand.name}\n`;
      msg += `│ 📝 Description: ${
        configCommand.longDescription?.en ||
        configCommand.shortDescription?.en ||
        "No description"
      }\n`;
      msg += `│ 📂 Category: ${
        configCommand.category || "None"
      }\n`;
      msg += `│ 🌐 Aliases: ${commandAliases}\n`;
      msg += `│ 👤 Author: ${
        configCommand.author || "Unknown"
      }\n`;
      msg += `│ ⚙ Version: ${
        configCommand.version || "1.0"
      }\n`;
      msg += `│ ⏳ Cooldown: ${
        configCommand.countDown || 1
      }s\n`;
      msg += `│ 🔐 Permission: ${
        configCommand.role ?? 0
      }\n`;
      msg += `╰────────────────────╯\n\n`;

      msg += `📖 Usage:\n${usage}\n\n`;

      msg += `╭‣ Total Commands: ${commands.size}\n`;
      msg += `╰‣ Prefix: ${prefix}`;

      return message.reply({
        body: msg,
        attachment: await getAttachment()
      });

    } catch (err) {
      console.error("HELP COMMAND ERROR:", err);

      return message.reply(
        `❌ Error: ${err.message}`
      );
    }
  }
};
