const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    config: {
        name: "kiss2",
        version: "3.5.0",
        author: "xalman",
        countDown: 5,
        role: 0,
        description: "Kiss someone using mention, reply, or UID",
        category: "love",
        guide: { en: "{p}{n} @mention | Reply to a message | {p}{n} [uid]" }
    },

    onStart: async function ({ api, event, args, usersData }) {
        const { threadID, messageID, senderID, mentions, type, messageReply } = event;
        
        let mentionID;
        if (type === "message_reply") {
            mentionID = messageReply.senderID;
        } else if (Object.keys(mentions).length > 0) {
            mentionID = Object.keys(mentions)[0];
        } else if (args[0]) {
            mentionID = args[0];
        }

        if (!mentionID) return api.sendMessage("Please mention someone, reply to a message, or provide a UID! 🌧️", threadID, messageID);

        try {
            const senderInfo = await usersData.get(senderID);
            const mentionInfo = await usersData.get(mentionID);

            const senderName = senderInfo.name;
            const mentionName = mentionInfo.name;
            const senderGender = senderInfo.gender; 

            const backgroundUrl = "https://i.ibb.co/jjhvv0j/74e00c6d62a7.jpg";
            const avatarSenderUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const avatarMentionUrl = `https://graph.facebook.com/${mentionID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            const [bgImg, avatarSender, avatarMention] = await Promise.all([
                loadImage(backgroundUrl),
                loadImage(avatarSenderUrl),
                loadImage(avatarMentionUrl)
            ]);

            const canvas = createCanvas(bgImg.width, bgImg.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            let senderPos, mentionPos;

            if (senderGender === 2) { 
                senderPos = { x: 320, y: 250, r: 40 };
                mentionPos = { x: 240, y: 190, r: 40 };
            } else {
                senderPos = { x: 240, y: 190, r: 40 };
                mentionPos = { x: 340, y: 250, r: 40 };
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(senderPos.x, senderPos.y, senderPos.r, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.drawImage(avatarSender, senderPos.x - senderPos.r, senderPos.y - senderPos.r, senderPos.r * 2, senderPos.r * 2);
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(mentionPos.x, mentionPos.y, mentionPos.r, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.drawImage(avatarMention, mentionPos.x - mentionPos.r, mentionPos.y - mentionPos.r, mentionPos.r * 2, mentionPos.r * 2);
            ctx.restore();

            const cachePath = path.join(__dirname, 'cache', `kiss_${Date.now()}.png`);
            if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));
            fs.writeFileSync(cachePath, canvas.toBuffer());

            return api.sendMessage({
                body: `${senderName} kissed ${mentionName} 💋`,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            }, messageID);

        } catch (error) {
            console.error(error);
            return api.sendMessage("An error occurred while processing the image.", threadID, messageID);
        }
    }
};
