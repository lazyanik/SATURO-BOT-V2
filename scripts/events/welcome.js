const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "Saimx69x",
    category: "events"
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const botID = api.getCurrentUserID();
    const newUser = logMessageData.addedParticipants[0];
    const joinedUserID = newUser?.userFbId;
    const joinedUserName = newUser?.fullName;

    if (!joinedUserID || joinedUserID === botID) return;

    let groupName, memberCount, gcImgUrl, adderName;
    const adderUID = event.author;

    try {
      await threadsData.refreshInfo(threadID);
      const info = await threadsData.get(threadID);

      groupName = info.threadName || "Unnamed Group";
      memberCount = info.members?.length || 1;

      gcImgUrl =
        info.imageSrc ||
        `https://graph.facebook.com/${threadID}/picture?width=720&height=720`;

      adderName = await usersData.getName(adderUID);
    } catch {
      groupName = "Unnamed Group";
      memberCount = 1;
      adderName = "Admin";
      gcImgUrl = `https://graph.facebook.com/${threadID}/picture?width=720&height=720`;
    }

    const timeStr = new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: true
    });

    const apiUrl =
      `https://xsaim8x-xxx-api.onrender.com/api/welcome2?` +
      `name=${encodeURIComponent(joinedUserName)}` +
      `&uid=${joinedUserID}` +
      `&threadname=${encodeURIComponent(groupName)}` +
      `&members=${memberCount}` +
      `&gcimg=${encodeURIComponent(gcImgUrl)}` +
      `&addername=${encodeURIComponent(adderName)}` +
      `&adderuid=${adderUID}`;

    try {
      const tmpDir = path.join(__dirname, "..", "cache");
      await fs.ensureDir(tmpDir);

      const imgPath = path.join(tmpDir, `welcome2_${joinedUserID}.png`);
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      fs.writeFileSync(imgPath, response.data);

      await api.sendMessage(
        {
          body:
            `‎𝐇𝐞𝐥𝐥𝐨 ${joinedUserName}\n` +
            `𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 ${groupName}\n` +
            `𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 ${memberCount} 𝐦𝐞𝐦𝐛𝐞𝐫 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐣𝐨𝐲 🎉\n` +
            `➕ 𝐀𝐝𝐝𝐞𝐝 𝐛𝐲 : ${adderName}\n` +
            `━━━━━━━━━━━━━━━━\n` +
            `📅 ${timeStr}`,
          attachment: fs.createReadStream(imgPath),
          mentions: [
            { tag: joinedUserName, id: joinedUserID },
            { tag: adderName, id: adderUID }
          ]
        },
        threadID
      );

      fs.unlinkSync(imgPath);
    } catch (err) {
      console.error("Welcome API Error:", err.message || err);
    }
  }
};
