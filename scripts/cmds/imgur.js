const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    version: "1.0.5",
    role: 0,
    author: "DUR4NTO | Anik Islam Sadik",
    countDown: 0,
    category: "imgur",
    guide: {
      en: "[reply to image or video]"
    }
  },

  onStart: async function ({ api, event }) {
    await this.uploadMedia(api, event);
  },

  uploadMedia: async function (api, event) {
    let mediaUrl;

    if (
      event.type === "message_reply" &&
      event.messageReply &&
      event.messageReply.attachments &&
      event.messageReply.attachments.length > 0
    ) {
      mediaUrl = event.messageReply.attachments[0].url;
    } else if (event.attachments && event.attachments.length > 0) {
      mediaUrl = event.attachments[0].url;
    } else {
      return api.sendMessage(
        "❌ No media detected. Please reply to an image/video or attach one.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const endpoint = `https://azadx69x-all-apis-top.vercel.app/api/imgur?url=${encodeURIComponent(mediaUrl)}`;
      const res = await axios.get(endpoint, { timeout: 20000 });
      const data = res.data;

      if (!data || data.success !== true || !data.url) {
        return api.sendMessage(
          "❌ Upload failed or invalid response from API.",
          event.threadID,
          event.messageID
        );
      }

      const reply = [
        "✅ Upload Successful",
        `🔗 URL: ${data.url}`
      ].join("\n");

      return api.sendMessage(reply, event.threadID, event.messageID);

    } catch (err) {
      console.error("Imgur upload error:", err);
      return api.sendMessage(
        "❌ Error uploading media. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
