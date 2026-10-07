module.exports = {
  config: {
    name: "bump",
    aliases: ["b"],
    version: "2.0",
    author: "Anik Islam Sadik",
    countDown: 3,
    role: 0,
    category: "box chat",
    shortDescription: { en: "bump" },
    longDescription: { en: "bump" },
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageReply } = event;
    if (!messageReply) return;

    const body = messageReply.body || "";
    const list = messageReply.attachments || [];

    const sticker = list.find(a => a.type === "sticker");
    if (sticker && !body) {
      return api.sendMessage({ sticker: sticker.ID || sticker.stickerID }, threadID);
    }

    const files = [];
    for (const a of list) {
      if (a.type === "sticker" || !a.url) continue;
      try {
        const stream = await global.utils.getStreamFromURL(a.url);
        if (stream) files.push(stream);
      } catch (e) {}
    }

    if (!body && files.length === 0) return;

    const form = {};
    if (body) form.body = body;
    if (files.length > 0) form.attachment = files;

    return api.sendMessage(form, threadID);
  }
};
