const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "buttslap",
    version: "1.2",
    author: "KSHITIZ | Anik Islam Sadik",
    countDown: 5,
    role: 0,
    shortDescription: "Buttslap image",
    longDescription: "Buttslap image",
    category: "fun",
    guide: {
      en: "   {pn} @tag / reply / <uid>"
    }
  },

  langs: {
    vi: {
      noUser: "You must tag, reply to a message, or enter the UID of the person you want to slap"
    },
    en: {
      noUser: "You must tag, reply to a message, or enter the UID of the person you want to slap"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    let uid2;

    if (Object.keys(event.mentions).length > 0) {
      uid2 = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      uid2 = event.messageReply.senderID;
    } else if (args[0] && !isNaN(args[0])) {
      uid2 = args[0];
    }

    if (!uid2) {
      return message.reply(getLang("noUser"));
    }

    try {
      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);

      const img = await new DIG.Spank().getImage(avatarURL1, avatarURL2);
      
      const tmpDir = `${__dirname}/tmp`;
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const pathSave = `${tmpDir}/${uid1}_${uid2}_spank.png`;
      fs.writeFileSync(pathSave, Buffer.from(img));

      let content = args.join(" ");
      if (Object.keys(event.mentions).length > 0) {
        content = content.replace(event.mentions[uid2], "").trim();
      } else if (args[0] && args[0] === uid2) {
        content = args.slice(1).join(" ").trim();
      }

      return message.reply({
        body: content || "hehe boii",
        attachment: fs.createReadStream(pathSave)
      }, () => {
        if (fs.existsSync(pathSave)) {
          fs.unlinkSync(pathSave);
        }
      });
    } catch (error) {
      console.error("[BUTTSLAP ERROR]", error);
      return message.reply("An error occurred while generating the image.");
    }
  }
};
