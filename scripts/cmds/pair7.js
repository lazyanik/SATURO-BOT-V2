const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

const { getStreamFromURL } = global.utils;

module.exports = {
        config: {
                name: "pair6",
                aliases: ["pair 6", "pr6"],
                version: "1.8",
                author: "MahMUD | Anik Islam Sadik",
                countDown: 10,
                role: 0,
                description: {
                        en: "Match with opposite gender members or by tag/reply including profile pictures",
                        vi: "Ghép đôi với các thành viên khác giới hoặc qua tag/reply bao gồm cả ảnh hồ sơ"
                },
                category: "love",
                guide: {
                        en: '   {pn} [@tag/reply]: Use to find your perfect pair',
                        vi: '   {pn} [@tag/reply]: Sử dụng để tìm cặp đôi hoàn hảo của bạn'
                }
        },

        langs: {
                en: {
                        noGender: "× Baby, your gender is not defined in your profile",
                        noMatch: "× Sorry, no %1 members found for you in this group",
                        selfPair: "× You cannot pair with yourself!",
                        success: "💞 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n• %1\n• %2\n\n𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: %3%",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noGender: "× Cưng ơi, giới tính của cưng không được xác định",
                        noMatch: "× Rất tiếc, không tìm thấy thành viên %1 nào cho cưng",
                        selfPair: "× Bạn không thể tự ghép đôi với chính mình!",
                        success: "💞 𝐆𝐡𝐞́𝐩 đ𝐨̂𝐢 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠\n• %1\n• %2\n\n𝐓𝐲̉ 𝐥𝐞̣̂ 𝐭𝐢̀𝐧𝐡 𝐜𝐚̉𝐦: %3%",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, threadsData, message, usersData, getLang }) {
                try {
                        const uidI = event.senderID;
                        let uid2;

                        // Check for Reply or Mention/Tag first
                        if (event.type === "message_reply") {
                                uid2 = event.messageReply.senderID;
                        } else if (event.mentions && Object.keys(event.mentions).length > 0) {
                                uid2 = Object.keys(event.mentions)[0];
                        } 
                        // If no reply or tag, fallback to random opposite gender logic
                        else {
                                const threadData = await threadsData.get(event.threadID);
                                const senderInfo = threadData.members.find(mem => mem.userID == uidI);
                                const gender1 = senderInfo?.gender;

                                if (!gender1 || (gender1 !== "MALE" && gender1 !== "FEMALE")) {
                                        return message.reply(getLang("noGender"));
                                }

                                const oppositeGender = gender1 === "MALE" ? "FEMALE" : "MALE";
                                const candidates = threadData.members.filter(
                                        member => member.gender === oppositeGender && member.inGroup && member.userID !== uidI
                                );

                                if (candidates.length === 0) {
                                        api.setMessageReaction("🥺", event.messageID, () => {}, true);
                                        return message.reply(getLang("noMatch", oppositeGender.toLowerCase()));
                                }

                                const matched = candidates[Math.floor(Math.random() * candidates.length)];
                                uid2 = matched.userID;
                        }

                        // Prevent pairing with self
                        if (uidI == uid2) {
                                return message.reply(getLang("selfPair"));
                        }

                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const name1 = await usersData.getName(uidI);
                        const name2 = await usersData.getName(uid2);
                        const lovePercent = Math.floor(Math.random() * 36) + 65;

                        const base = await baseApiUrl();
                        const apiUrl1 = `${base}/api/pfp?mahmud=${uidI}`;
                        const apiUrl2 = `${base}/api/pfp?mahmud=${uid2}`;

                        return message.reply({
                                body: getLang("success", name1, name2, lovePercent),
                                attachment: [
                                        await getStreamFromURL(apiUrl1),
                                        await getStreamFromURL(apiUrl2)
                                ]
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                        });

                } catch (err) {
                        console.error("Pair6 Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
