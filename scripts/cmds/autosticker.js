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
  "2041014432792697",
  "1747082948936290",
  "2041017422792398",
  "456541416755637",
  "1747092188935366",
  "1350636100108882",
  "2041011389459668"
];

module.exports = {
  config: {
    name: "autosticker",
    aliases: ["sticker", "stickerlist", "autoreplysticker", "asticker"],
    version: "1.9",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: "Replies to stickers & shows sticker list",
    longDescription: "Automatically replies with a sticker when a human user sends a sticker. Shows total sticker count on command execution.",
    category: "fun",
    guide: "Send a sticker or use command: {pn} or {pn} list"
  },

  // Handles text command executions
  onStart: async function ({ api, event }) {
    return api.sendMessage(`Auto Sticker is active! Total stickers available in database: ${stickerIDs.length}`, event.threadID, event.messageID);
  },

  // Handles automatic sticker replies when someone sends a sticker attachment
  onChat: async function ({ api, event, usersData }) {
    if (!event || event.senderID === api.getCurrentUserID()) return;

    // Check if sender is a bot user (prevents bot loops)
    if (usersData) {
      const senderData = await usersData.get(event.senderID);
      if (senderData && senderData.isBot) return;
    }

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
