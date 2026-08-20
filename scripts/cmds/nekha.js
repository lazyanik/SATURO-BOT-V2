const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
config: {
name: "nekha",
version: "1.0.5",
author: "Anik Islam Sadik",
countDown: 5,
role: 0,
category: "fun",
description: "Mention image and user image both shifted up slightly.",
guide: {
en: "{pn} @mention"
}
},

onStart: async function ({ api, event }) {
const { threadID, messageID, senderID, mentions } = event;

const mentionID = Object.keys(mentions)[0];
if (!mentionID) return api.sendMessage("Please mention someone first!", threadID, messageID);

const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
const imgPath = path.join(cacheDir, `nekha_${Date.now()}.png`);

try {
const backgroundUrl = "https://i.imgur.com/QcxaSFR.jpeg";
const userAvatarUrl = `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
const mentionAvatarUrl = `https://graph.facebook.com/${mentionID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

const [bgImg, userImg, mentionImg] = await Promise.all([
loadImage(backgroundUrl),
loadImage(userAvatarUrl),
loadImage(mentionAvatarUrl)
]);

const canvas = createCanvas(bgImg.width, bgImg.height);
const ctx = canvas.getContext("2d");

ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

const userAvatarSize = 150; 
const mentionAvatarSize = 120; 

// পজিশন আপডেট
const mentionY = (canvas.height / 2) - 40; // মেনশন ইমেজ সামান্য উপরে তোলা হলো
const userY = (canvas.height / 2) - 100; // ইউজার ইমেজ আগের মতোই উপরে আছে

// ১. যাকে মেনশন করা হয়েছে তার ইমেজ (Left Side & Slightly Up)
ctx.save();
ctx.beginPath();
ctx.arc(150, mentionY, mentionAvatarSize / 2, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.drawImage(mentionImg, 150 - mentionAvatarSize / 2, mentionY - mentionAvatarSize / 2, mentionAvatarSize, mentionAvatarSize);
ctx.restore();

// ২. ইউজারের নিজের ইমেজ (Right Side & Shifted Up)
ctx.save();
ctx.beginPath();
ctx.arc(canvas.width - 150, userY, userAvatarSize / 2, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.drawImage(userImg, canvas.width - 150 - userAvatarSize / 2, userY - userAvatarSize / 2, userAvatarSize, userAvatarSize);
ctx.restore();

const buffer = canvas.toBuffer("image/png");
fs.writeFileSync(imgPath, buffer);

return api.sendMessage({
body: "Here is your edited image from nekha command!",
attachment: fs.createReadStream(imgPath)
}, threadID, () => {
if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
}, messageID);

} catch (error) {
console.log("NEKHA ERROR:", error);
return api.sendMessage("An error occurred while creating the image.", threadID, messageID);
}
}
};
