module.exports = {
  config: {
    name: "kick",
    version: "1.5",
    author: "NTKhang | Fixed by Anik",
    countDown: 5,
    role: 1, // group admin only
    description: { en: "Kick member out of chat box" },
    category: "box chat",
    guide: { en: "{pn} @tag or reply" }
  },
  langs: {
    en: {
      needAdmin: "❌ Bot ke group admin banate hobe, tarpor amake kick permission dite hobe",
      noPermission: "❌ Tumi group admin na",
            cannotKick: "❌ Admin, bot, ba nijeke kick kora jabe na"
    }
  },

  onStart: async function ({ message, event, args, api, getLang, usersData }) {
    const { threadID, senderID } = event;
    const botID = api.getCurrentUserID();

    // 1. Check user is admin or not
    const info = await api.getThreadInfo(threadID);
    const userIsAdmin = info.adminIDs.some(a => a.id === senderID);
    if (!userIsAdmin && event.role < 1) return message.reply(getLang("noPermission"));

    const kickList = [];
    const nameList = [];

    async function kickUser(uid) {
      if (uid === botID) return "CANNOT";
      if (info.adminIDs.some(a => a.id === uid)) return "CANNOT";
      
      try {
        await api.removeUserFromGroup(uid, threadID); // direct try
        const name = await usersData.getName(uid);
        kickList.push(uid);
        nameList.push(name);
        return "OK";
      } catch (e) {
        console.log("KICK ERROR:", e);
        return "ERROR"; // ekhanei bujhba bot admin na
      }
    }

    // Reply diye kick
    if (event.type === "message_reply") {
      const target = event.messageReply.senderID;
      const res = await kickUser(target);
      if (res === "CANNOT") return message.reply(getLang("cannotKick"));
      if (res === "ERROR") return message.reply(getLang("needAdmin"));
          }

    // Tag diye kick
    const uids = Object.keys(event.mentions);
    if (uids.length === 0) return message.SyntaxError();

    for (const uid of uids) await kickUser(uid);

    if (kickList.length === 0) return message.reply(getLang("cannotKick"));
    }
};
