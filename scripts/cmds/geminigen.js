const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const apiUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";

async function getApiUrl() {
 const res = await axios.get(apiUrl);
 return res.data.apiv3;
}

async function urlToBase64(url) {
 const res = await axios.get(url, { responseType: "arraybuffer" });
 return Buffer.from(res.data).toString("base64");
}

module.exports = {
 config: {
 name: "geminigen",
 version: "1.0",
 author: "Saimx69x (Api by Kay)",
 countDown: 5,
 role: 0,
 shortDescription: "Generate or edit images using text prompts",
 longDescription:
 "Generate a new image from a text prompt or edit an existing image by replying to it.",
 category: "ai",
 guide:
 "{p}geminigen <prompt>\n" +
 "{p}geminigen <prompt> (reply to an image to edit it)"
 },

 onStart: async function ({ api, event, args, message }) {
 const repliedImage = event.messageReply?.attachments?.[0];
 const prompt = args.join(" ").trim();

 if (!prompt) {
 return message.reply(
 "Please provide a prompt.\n\nExamples:\n/geminigen a cyberpunk city\n/geminigen make me anime (reply to an image)"
 );
 }

 const processingMsg = await message.reply("Processing your image...");

 const imgPath = path.join(
 __dirname,
 "cache",
 `${Date.now()}_geminigen.jpg`
 );

 try {
 const API_URL = await getApiUrl();

 const payload = {
 prompt: repliedImage
 ? `Edit the given image based on this description:\n${prompt}`
 : `Create a high quality image based on this description:\n${prompt}`,
 format: "jpg"
 };

 if (repliedImage && repliedImage.type === "photo") {
 payload.images = [await urlToBase64(repliedImage.url)];
 }

 const res = await axios.post(API_URL, payload, {
 responseType: "arraybuffer",
 timeout: 180000
 });

 await fs.ensureDir(path.dirname(imgPath));
 await fs.writeFile(imgPath, Buffer.from(res.data));

 await api.unsendMessage(processingMsg.messageID);

 await message.reply({
 body: repliedImage
 ? `Image edited successfully.\nPrompt: ${prompt}`
 : `Image generated successfully.\nPrompt: ${prompt}`,
 attachment: fs.createReadStream(imgPath)
 });
 } catch (error) {
 console.error("GEMINIGEN Error:", error?.response?.data || error.message);
 await api.unsendMessage(processingMsg.messageID);
 message.reply("Failed to process the image. Please try again later.");
 } finally {
 if (fs.existsSync(imgPath)) {
 await fs.remove(imgPath);
 }
 }
 }
};
