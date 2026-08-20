const axios = require('axios');
const fs = require('fs');
const nix = "https://raw.githubusercontent.com/aryannix/stuffs/refs/heads/main/raw/apis.json";

module.exports = {
  config: {
    name: "say",
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    category: "tts",
    description: "bot will make your text into voice. Reply to any message with 'say' to convert that message into voice.",
    guide: {
      en: "{pn} your text\n{pn} (reply to a message)"
    }
  },
  onStart: async function ({ api: fbApi, args, message, event }) {
    let text;

    if (event.type === "message_reply" && event.messageReply && event.messageReply.body) {
      text = event.messageReply.body;
    } else if (args && args.length > 0) {
      text = args.join(" ");
    } else {
      text = '';
    }

    if (!text) {
      const prefix = global.utils.getPrefix(event.threadID);
      return message.reply(`Please provide some text, or reply to a message with "${prefix}say".\nExample:\n${prefix}say hi there`);
    }

    const dirPath = `${__dirname}/tmp`;
    const path = `${dirPath}/tts_${event.senderID}.mp3`;

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    try {
      const { data: apis } = await axios.get(nix);
      const apiUrl = `${apis.api}/say?text=${encodeURIComponent(text)}`;

      const response = await axios({
        method: "get",
        url: apiUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(path);
      response.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: text,
          attachment: fs.createReadStream(path)
        }, () => {
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        });
      });

      writer.on("error", (err) => {
        console.error(err);
        message.reply("An error occurred while saving the audio file");
      });

    } catch (err) {
      console.error(err);
      message.reply("No problem try again");
    }
  }
};
