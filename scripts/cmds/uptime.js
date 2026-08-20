const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");
const os = require("os");

module.exports = {
  config: {
    name: "up",
    aliases: ["uptime"],
    version: "0.0.7",
    author: "Anik Islam Sadik",
    countDown: 3,
    role: 0,
    shortDescription: "bot stats image",
    longDescription: "Uptime, ping, CPU load, owner info with canvas image",
    category: "image",
    guide: "{p}up"
  },

  onStart: async function ({ event, message, api }) {
    try {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

      const ping = Date.now() - event.timestamp;
      const cpuUsage = os.loadavg()[0].toFixed(2);
      const owner = "ꫝɴ֟፝ɪᴋ ɪsʟꫝᴍ ѕꫝᴅɪᴋ";

      const canvas = Canvas.createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");
      const bgUrl = "https://i.imgur.com/0kEWVsr.jpeg";
      const bgImg = await Canvas.loadImage(bgUrl);

      ctx.drawImage(
        bgImg,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
      );

      gradient.addColorStop(0, "rgba(0,0,0,0.25)");
      gradient.addColorStop(1, "rgba(0,0,0,0.5)");

      ctx.fillStyle = gradient;
      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 8;

      const leftMargin = 40;
      let startY = 120;

      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 60px Sans";
      ctx.fillText(
        "BOT STATUS",
        leftMargin,
        startY
      );

      const infoTexts = [
        `Uptime: ${uptimeStr}`,
        `Ping: ${ping} ms`,
        `CPU Load: ${cpuUsage}`,
        `Owner: Anik Islam Sadik`
      ];
      ctx.fillStyle = "#F0F0F0";
      ctx.font = "bold 40px Sans";

      startY += 80;

      const spacing = 70;

      infoTexts.forEach(text => {
        ctx.fillText(
          text,
          leftMargin,
          startY
        );
        startY += spacing;
      });

      const filePath = path.join(__dirname, "up3.png");

      fs.writeFileSync(
        filePath,
        canvas.toBuffer("image/png")
      );

      const bodyText = `
✿•≫────•『ALYA BOT』•────≪•✿
⏳ Uptime: ${uptimeStr}
📶 Ping: ${ping} ms
🖥 CPU Load: ${cpuUsage}
👑 Owner: ${owner}
✿•≫───────────────≪•✿
`;

      await message.reply({
        body: bodyText,
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Could not fetch");
    }
  }
};
