const stickerIDs = [
  "1237286490812351",
  "456542403422205",
  "456544143422031",
  "456545143421931",
  "392309937532985",
  "392309834199662",
  "392309624199683",
  "1356375286201630",
  "1237285187479148",
  "1237285867479080",
  "1356370689535423",
  "1356407482865077",
  "840417168322612",
  "840424478321881",
  "840349011662761",
  "1350643753441450",
  "1237286070812393",
  "840426104988385",
  "2041020049458802",
  "392309990866313",
  "392309890866323",
  "1350645153441310",
  "456536873422758",
  "2041014432792697"
];

module.exports = {
  config: {
    name: "autosticker",
    aliases: ["sticker", "stickerlist", "autoreplysticker", "asticker"],
    version: "1.8",
    author: "Anik Islam Sadik",
    countDown: 0,
    role: 0,
    shortDescription: "Replies to stickers & shows sticker list",
    longDescription: "Automatically replies with a sticker when a sticker is sent. Shows total sticker count on command execution.",
    category: "fun",
    guide: "Send a sticker or use command: {pn} or {pn} list"
  },

  // Handles text command executions (with prefix for public, prefix/prefixless for admins natively)
  onStart: async function ({ api, event }) {
    return api.sendMessage(`Auto Sticker is active! Total stickers available in database: ${stickerIDs.length}`, event.threadID, event.messageID);
  },

  // Handles automatic sticker replies when someone sends a sticker attachment
  onChat: async function ({ api, event }) {
    if (!event || event.senderID === api.getCurrentUserID()) return;

    if (event.attachments && event.attachments.length > 0 && event.attachments[0].type === "sticker") {
      const randomSticker = stickerIDs[Math.floor(Math.random() * stickerIDs.length)];

      try {
        return api.sendMessage({
          sticker: randomSticker
        }, event.threadID, event.messageID);
      } catch (error) {
        console.error("AutoSticker Error:", error);
      }
    }
  }
};
