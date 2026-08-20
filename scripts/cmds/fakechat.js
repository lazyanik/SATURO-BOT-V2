const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

/* ===== SETTINGS ===== */
const PRICE = 200000;
const OWNER_UID = ["61590594545013"]; 

module.exports = {
  config: {
    name: "fakechat",
    aliases: ["fc"],
    version: "9.0",
    author: "Anik Islam Sadik",
    category: "fun",
    guide: "Reply → {p}fc Hi 😈 | How are you? ❤️"
  },

  onStart: async function ({ api, event, message, args, usersData }) {
    if (!event.messageReply) return message.reply("❌ Reply করে fakechat command দাও");

    const uid = event.messageReply.senderID;
    const texts = args.join(" ").split("|").map(t => t.trim()).filter(Boolean);
    if (!texts.length) return message.reply("❌ Message দাও");

    try {
      // ইমোজি ফন্ট ডাউনলোড (যদি না থাকে)
      const emojiPath = path.join(__dirname, "NotoColorEmoji.ttf");
      if (!fs.existsSync(emojiPath)) {
        await downloadFile("https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf", emojiPath);
      }

      if (!global.__fcFontsLoaded) {
        // ফন্ট ফ্যামিলি নাম "Emoji" হিসেবে রেজিস্টার করা হলো
        registerFont(emojiPath, { family: "Emoji" });
        global.__fcFontsLoaded = true;
      }

      const info = await api.getUserInfo(uid);
      const name = info[uid]?.name || "Messenger User";
      const avatarImg = await getAvatar(uid);

      /* ===== CANVAS SETUP ===== */
      const W = 850;
      const padX = 26, padY = 22, lineH = 42, gap = 15;
      let y = 110;

      const temp = createCanvas(1, 1).getContext("2d");
      // এখানে ফন্ট অর্ডারে ইমোজি ফন্টকে সর্বোচ্চ প্রাধান্য দেওয়া হয়েছে
      temp.font = '28px "Emoji", sans-serif';
      
      const maxW = W - 250;
      const bubbles = texts.map(text => {
        const lines = wrapText(temp, text, maxW - (padX * 2));
        const w = Math.max(...lines.map(l => temp.measureText(l).width));
        return { lines, w: Math.max(w + (padX * 2), 110), h: (lines.length * lineH) + (padY * 2) };
      });

      const H = bubbles.reduce((s, b) => s + b.h + gap, 0) + 160;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      // BG (Pure Black)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        
        // Name (iOS Style Grey)
        ctx.fillStyle = "#8E8E93";
        ctx.font = '20px sans-serif';
        ctx.fillText(name, 120, y - 18);

        // Bubble
        ctx.fillStyle = "#262628";
        drawiOSBubble(ctx, 120, y, b.w, b.h, 30);

        // Text with Emoji Force
        ctx.fillStyle = "#FFFFFF";
        // বিশেষ ড্রয়িং কনফিগ
        ctx.font = '28px "Emoji", sans-serif';
        ctx.textBaseline = "top";

        let ty = y + padY;
        for (const l of b.lines) {
          ctx.fillText(l, 120 + padX, ty);
          ty += lineH;
        }

        if (i === bubbles.length - 1) {
          const avatarSize = 58;
          const ay = y + b.h - avatarSize + 2;
          ctx.save();
          ctx.beginPath();
          ctx.arc(68, ay + (avatarSize/2), avatarSize/2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, 39, ay, avatarSize, avatarSize);
          ctx.restore();
        }
        y += b.h + gap;
      }

      const outPath = path.join(__dirname, `fc_final_${Date.now()}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer());
      await message.reply({ attachment: fs.createReadStream(outPath) });
      fs.unlinkSync(outPath);

    } catch (e) {
      console.error(e);
      message.reply("❌ Error: " + e.message);
    }
  }
};

/* ===== HELPERS (FIXED) ===== */

async function downloadFile(url, dest) {
  const res = await axios({ url, method: 'GET', responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    res.data.pipe(writer).on('finish', resolve).on('error', reject);
  });
}

async function getAvatar(uid) {
  try {
    const res = await axios.get(`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" });
    return await loadImage(res.data);
  } catch {
    return await loadImage("https://i.imgur.com/vMc6asY.png");
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    if (ctx.measureText(currentLine + " " + words[i]).width < maxWidth) {
      currentLine += " " + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

function drawiOSBubble(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
