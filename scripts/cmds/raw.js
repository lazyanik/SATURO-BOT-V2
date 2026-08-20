const fs = require('fs');
const path = require('path');
const axios = require('axios');

const baseApiUrl = async () => {
  const base = await axios.get('https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json');
  return base.data.gist;
};

module.exports = {
  config: {
    name: "raw",
    version: "1.0",
    role: 4,
    author: "Saimx69x",
    description: "Generate a RAW text link from replied code or from local bot files",
    category: "convert",
    guide: { 
      en: "{pn} → Reply to a code snippet to create RAW Link\n{pn} [filename] → Create raw from cmds folder\n{pn} -e [filename] → Create raw from events folder\n⚠ Auto delete after 24 hours."
    },
    countDown: 1
  },

  onStart: async function ({ api, event, args }) {
    let fileName = args[0];
    let code = "";

    try {
   
      if (event.type === "message_reply" && event.messageReply?.body) {
        code = event.messageReply.body;

        if (!fileName) {
          const time = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
          fileName = `raw_${time}.txt`;
        } else if (!fileName.endsWith(".txt")) {
          fileName = `${fileName}.txt`;
        }
      }

      else if (fileName) {
        let filePath;

        if (args[0] === "-e") {
          const eventFile = args[1];
          if (!eventFile) {
            return api.sendMessage("⚠ | Please provide a filename after -e.", event.threadID, event.messageID);
          }
          fileName = eventFile.endsWith(".js") ? eventFile : `${eventFile}.js`;
          filePath = path.resolve(__dirname, '../../scripts/events', fileName);
        } else {
          const commandsPath = path.resolve(__dirname, '../../scripts/cmds');
          filePath = fileName.endsWith(".js")
            ? path.join(commandsPath, fileName)
            : path.join(commandsPath, `${fileName}.js`);
        }

        if (!fs.existsSync(filePath)) {
          const dirToSearch = args[0] === "-e"
            ? path.resolve(__dirname, '../../scripts/events')
            : path.resolve(__dirname, '../../scripts/cmds');

          const files = fs.readdirSync(dirToSearch);
          const similar = files.filter(f =>
            f.toLowerCase().includes(fileName.replace(".js", "").toLowerCase())
          );

          if (similar.length > 0) {
            return api.sendMessage(
              `❌ File not found. Did you mean:\n${similar.join('\n')}`,
              event.threadID,
              event.messageID
            );
          }

          return api.sendMessage(
            `❌ File "${fileName}" not found in ${args[0] === "-e" ? "events" : "cmds"} folder.`,
            event.threadID,
            event.messageID
          );
        }

        code = await fs.promises.readFile(filePath, "utf-8");
      }

      else {
        return api.sendMessage("⚠ | Please reply with code OR provide a file name.", event.threadID, event.messageID);
      }

      const encoded = encodeURIComponent(code);
      const apiUrl = await baseApiUrl();
      const response = await axios.post(`${apiUrl}/raw`, { code: encoded });

      const link = response.data?.raw_url;
      if (!link) throw new Error("Invalid API Response");

      const rawMsg = `${link}`;
      return api.sendMessage(rawMsg, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ RAW Error:", err.message || err);
      return api.sendMessage(
        "⚠️ Failed to create RAW link. Maybe server issue.\n💬 Contact author for help: https://m.me/ye.bi.nobi.tai.244493",
        event.threadID,
        event.messageID
      );
    }
  }
};
