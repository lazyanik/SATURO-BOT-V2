const { GoatWrapper } = require("fca-saim-x69x");

module.exports = {
  config: {
    name: "pfp",
    aliases: ["pp", "profile"],
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Show user's profile picture",
    longDescription: "View profile picture of yourself, a tagged user, replied user, or a specific UID.",
    category: "image",
    guide: {
      en: "{pn} [@tag | reply | uid] — Show profile picture"
    }
  },

  onStart: async function ({ event, message, args, usersData }) {
    try {
      let targetID;

      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } 
      else if (Object.keys(event.mentions)[0]) {
        targetID = Object.keys(event.mentions)[0];
      } 
      else if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
      } 
      else {
        targetID = event.senderID;
      }

      const name = await usersData.getName(targetID).catch(() => "Unknown User");
      const avatarURL = await usersData.getAvatarUrl(targetID);

      return message.reply({
        body: `🖼️ 𝑷𝒓𝒐𝒇𝒊𝒍𝒆 𝑷𝒊𝒄𝒕𝒖𝒓𝒆 𝒐𝒇\n💫 ${name} (${targetID})`,
        attachment: await global.utils.getStreamFromURL(avatarURL)
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Could not fetch the profile picture. Maybe UID is invalid or privacy blocked.");
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
