const axios = require("axios");

module.exports = {
  config: {
    name: "font",
    aliases: ["fonts"],
    version: "0.0.7",
    author: "Anik Islam Sadik",
    role: 0,
    shortDescription: "🎨 Convert text to stylish",
    longDescription: "Generate stylish fonts",
    category: "utility",
    guide: {
      en: "{pn} list - Show all font styles\n{pn} <number> <text> - Convert text"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    try { api.setMessageReaction("🎨", messageID, threadID, () => {}, true); } catch(e) {}

    if (!args.length) {
      return api.sendMessage({
        body: `╭─❯ USAGE:
│╭─❯ LIST → Show all styles
│╰─❯ <1-30> <text> Convert`
      }, threadID, messageID);
    }

    const arg0 = args[0].toLowerCase();

    if (arg0 === "list" || arg0 === "all") {
      return showFontList(threadID, api, messageID);
    }

    const styleNum = parseInt(arg0);
    if (!isNaN(styleNum)) {
      if (styleNum < 1 || styleNum > 30) {
        try { api.setMessageReaction("❌", messageID, threadID, () => {}, true); } catch(e) {}
        return api.sendMessage(`⚠️ Invalid style! Choose 1-30`, threadID, messageID);
      }

      const text = args.slice(1).join(" ");
      if (!text) {
        return api.sendMessage({
          body: `╭─❯ USAGE:\n│╰─❯ font ${styleNum} <your text>`
        }, threadID, messageID);
      }

      return convertFont(api, threadID, messageID, styleNum, text);
    }

    return api.sendMessage({
      body: `╭─❯ USAGE:
│╭─❯ LIST → Show all styles
│╰─❯ <1-30> <text> → Convert`
    }, threadID, messageID);
  }
};

async function convertFont(api, threadID, messageID, styleNum, text) {
  try {
    const url = `https://azadx69x-all-apis-top.vercel.app/api/font`;
    const res = await axios.get(url, { params: { text, style: styleNum }, timeout: 15000 });

    if (res.data && res.data.output) {
      await api.sendMessage({ body: res.data.output }, threadID, messageID);
      try { api.setMessageReaction("🪄", messageID, threadID, () => {}, true); } catch(e) {}
    } else {
      throw new Error("No output");
    }
  } catch (err) {
    await api.sendMessage({ body: `❌ Failed to generate font!` }, threadID, messageID);
    try { api.setMessageReaction("❌", messageID, threadID, () => {}, true); } catch(e) {}
  }
}

async function showFontList(threadID, api, messageID) {
  let message = `╭━━━━━━━━━━━━━━━╮\n│    ALL FONT STYLES\n├━━━━━━━━━━━━━━━┤\n`;
  const previewText = "Anik Islam Sadik";

  for (let i = 1; i <= 30; i++) {
    try {
      const res = await axios.get("https://azadx69x-all-apis-top.vercel.app/api/font", { params: { text: previewText, style: i }, timeout: 3000 });
      const preview = res.data.output || previewText;
      const num = i.toString().padStart(2, '0');
      message += `│❯ ${num}. ${preview}\n`;
    } catch (err) {
      const num = i.toString().padStart(2, '0');
      message += `│❯ ${num}. ⚠️ Error\n`;
    }
  }

  message += `├━━━━━━━━━━━━━━━┤\n│    font <1-30> <text>\n╰━━━━━━━━━━━━━━━╯`;

  await api.sendMessage({ body: message }, threadID, messageID);
  try { api.setMessageReaction("🪄", messageID, threadID, () => {}, true); } catch(e) {}
                                                                                                  }
