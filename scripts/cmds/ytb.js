const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// Config for 1000x2000 layout
const W = 1000;
const HEADER_H = 160;
const ROW_H = 190;
const PADDING = 30;
const THUMB_W = 260;
const THUMB_H = 146;
const FOOT_H = 90;

// Remote API list (all point to same backend, just mirrors)
const APIS_JSON_URL = "https://raw.githubusercontent.com/eshitax/shadowx-apis/refs/heads/main/apis.json";

// Cached API list
let API_LIST = [];
let API_LIST_LAST_FETCH = 0;
const API_LIST_TTL = 5 * 60 * 1000; // 5 min

// -------------------- API HELPERS --------------------

async function getApiList() {
  const now = Date.now();
  if (API_LIST.length && (now - API_LIST_LAST_FETCH) < API_LIST_TTL) {
    return API_LIST;
  }
  try {
    const { data } = await axios.get(APIS_JSON_URL, { timeout: 10000 });
    let list = [];

    if (Array.isArray(data)) {
      list = data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.apis)) list = data.apis;
      else if (Array.isArray(data.urls)) list = data.urls;
      else if (Array.isArray(data.api)) list = data.api;
      else list = Object.values(data).filter(v => typeof v === "string");
    }

    list = list
      .filter(u => typeof u === "string" && /^https?:\/\//.test(u))
      .map(u => u.replace(/\/+$/, "")); // strip trailing slash

    if (list.length) {
      API_LIST = list;
      API_LIST_LAST_FETCH = now;
      return API_LIST;
    }
  } catch (e) {
    console.log("⚠️ Failed to fetch APIs JSON:", e.message);
  }

  return API_LIST;
}

// Try all APIs in order; return first successful response
async function tryAllApis(buildPath) {
  const apis = await getApiList();
  if (!apis.length) throw new Error("No APIs available (could not load API list)");

  let lastErr = null;

  for (const base of apis) {
    const url = `${base}${buildPath}`;
    try {
      console.log("📥 Trying API:", url);
      const { data } = await axios.get(url, { timeout: 25000 });
      if (data && data.success !== false) {
        console.log("✅ Success from:", base);
        return { data, base };
      }
      console.log("⚠️ API returned unsuccessful:", base);
    } catch (e) {
      console.log("❌ API failed:", base, "-", e.message);
      lastErr = e;
    }
  }
  throw lastErr || new Error("All APIs failed");
}

// -------------------- TEXT HELPERS --------------------

function cleanText(text) {
  if (!text) return "";
  const boldMap = {
    '𝗮': 'a', '𝗯': 'b', '𝗰': 'c', '𝗱': 'd', '𝗲': 'e', '𝗳': 'f', '𝗴': 'g', '𝗵': 'h', '𝗶': 'i', '𝗷': 'j', '𝗸': 'k', '𝗹': 'l', '𝗺': 'm',
    '𝗻': 'n', '𝗼': 'o', '𝗽': 'p', '𝗾': 'q', '𝗿': 'r', '𝘀': 's', '𝘁': 't', '𝘂': 'u', '𝘃': 'v', '𝘄': 'w', '𝘅': 'x', '𝘆': 'y', '𝘇': 'z',
    '𝗔': 'A', '𝗕': 'B', '𝗖': 'C', '𝗗': 'D', '𝗘': 'E', '𝗙': 'F', '𝗚': 'G', '𝗛': 'H', '𝗜': 'I', '𝗝': 'J', '𝗞': 'K', '𝗟': 'L', '𝗠': 'M',
    '𝗡': 'N', '𝗢': 'O', '𝗣': 'P', '𝗤': 'Q', '𝗥': 'R', '𝗦': 'S', '𝗧': 'T', '𝗨': 'U', '𝗩': 'V', '𝗪': 'W', '𝗫': 'X', '𝗬': 'Y', '𝗭': 'Z',
    '𝐚': 'a', '𝐛': 'b', '𝐜': 'c', '𝐝': 'd', '𝐞': 'e', '𝐟': 'f', '𝐠': 'g', '𝐡': 'h', '𝐢': 'i', '𝐣': 'j', '𝐤': 'k', '𝐥': 'l', '𝐦': 'm',
    '𝐧': 'n', '𝐨': 'o', '𝐩': 'p', '𝐪': 'q', '𝐫': 'r', '𝐬': 's', '𝐭': 't', '𝐮': 'u', '𝐯': 'v', '𝐰': 'w', '𝐱': 'x', '𝐲': 'y', '𝐳': 'z',
    '𝐀': 'A', '𝐁': 'B', '𝐂': 'C', '𝐃': 'D', '𝐄': 'E', '𝐅': 'F', '𝐆': 'G', '𝐇': 'H', '𝐈': 'I', '𝐉': 'J', '𝐊': 'K', '𝐋': 'L', '𝐌': 'M',
    '𝐍': 'N', '𝐎': 'O', '𝐏': 'P', '𝐐': 'Q', '𝐑': 'R', '𝐒': 'S', '𝐓': 'T', '𝐔': 'U', '𝐕': 'V', '𝐖': 'W', '𝐗': 'X', '𝐘': 'Y', '𝐙': 'Z',
    '𝟬': '0', '𝟭': '1', '𝟮': '2', '𝟯': '3', '𝟰': '4', '𝟱': '5', '𝟲': '6', '𝟳': '7', '𝟴': '8', '𝟵': '9'
  };
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += boldMap[text[i]] || text[i];
  }
  return result;
}

function formatViews(n) {
  if (!n || n === 0) return "0";
  if (typeof n === 'string') {
    if (n.includes('M')) return n;
    if (n.includes('K')) return n;
    if (n.includes('B')) return n;
    return n;
  }
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function truncate(text, maxLen) {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen - 2) + ".." : text;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split('');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

// -------------------- IMAGE GENERATOR --------------------

async function generateSearchImage(videos, query, type, quality) {
  const resultsCount = Math.min(videos.length, 6);
  const totalH = HEADER_H + (resultsCount * ROW_H) + FOOT_H;
  const canvas = createCanvas(W, totalH);
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, 0, totalH);
  bg.addColorStop(0, "#000814");
  bg.addColorStop(1, "#001d3d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, totalH);

  ctx.fillStyle = "rgba(0, 53, 102, 0.6)";
  ctx.fillRect(0, 0, W, HEADER_H);

  ctx.fillStyle = "#00b4d8";
  ctx.font = "bold 46px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("🎵 YOUTUBE DOWNLOADER", PADDING, 85);

  ctx.fillStyle = "#caf0f8";
  ctx.font = "24px 'Segoe UI', Arial, sans-serif";
  const typeLabel = type === "audio" ? "🎵 AUDIO" : "📹 VIDEO";
  const qualityText = type === "video" ? ` • QUALITY: ${quality}p` : "";
  ctx.fillText(`${typeLabel} • "${truncate(query, 55)}"${qualityText}`, PADDING, 125);

  ctx.strokeStyle = "#003566";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PADDING, HEADER_H - 10);
  ctx.lineTo(W - PADDING, HEADER_H - 10);
  ctx.stroke();

  for (let i = 0; i < resultsCount; i++) {
    const r = videos[i];
    const y = HEADER_H + (i * ROW_H);
    let currentY = y + 30;

    if (i % 2 === 0) {
      ctx.fillStyle = "rgba(0, 53, 102, 0.25)";
      ctx.fillRect(0, y, W, ROW_H);
    }

    ctx.fillStyle = "#00b4d8";
    ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`${i + 1}`, PADDING, y + 85);

    const thumbX = PADDING + 60;
    const thumbY = y + (ROW_H - THUMB_H) / 2;

    try {
      const img = await loadImage(r.thumbnail);
      ctx.drawImage(img, thumbX, thumbY, THUMB_W, THUMB_H);
    } catch (e) {
      ctx.fillStyle = "#003566";
      ctx.fillRect(thumbX, thumbY, THUMB_W, THUMB_H);
      ctx.fillStyle = "#00b4d8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NO IMAGE", thumbX + THUMB_W / 2, thumbY + THUMB_H / 2);
      ctx.textAlign = "left";
    }

    ctx.strokeStyle = "#0066a0";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(thumbX, thumbY, THUMB_W, THUMB_H);

    const textX = thumbX + THUMB_W + 20;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
    const cleanTitle = cleanText(r.title);
    const maxTitleWidth = W - textX - 30;
    const titleLines = wrapText(ctx, cleanTitle, maxTitleWidth);

    for (let lineIdx = 0; lineIdx < titleLines.length; lineIdx++) {
      ctx.fillText(titleLines[lineIdx], textX, currentY + (lineIdx * 28));
    }

    const titleHeight = titleLines.length * 28;
    const channelY = currentY + titleHeight + 5;

    ctx.fillStyle = "#00b4d8";
    ctx.font = "18px 'Segoe UI', Arial, sans-serif";
    const cleanChannel = cleanText(r.author.name);
    let channelText = cleanChannel;
    const maxChannelWidth = W - textX - 30;
    if (ctx.measureText(channelText).width > maxChannelWidth) {
      channelText = truncate(cleanChannel, 40);
    }
    ctx.fillText(`${channelText} • ${r.timestamp}`, textX, channelY);

    ctx.fillStyle = "#6c757d";
    ctx.font = "16px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`${formatViews(r.views)} views`, textX, channelY + 25);

    if (i < resultsCount - 1) {
      ctx.strokeStyle = "#003566";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PADDING, y + ROW_H);
      ctx.lineTo(W - PADDING, y + ROW_H);
      ctx.stroke();
    }
  }

  const footerY = totalH - FOOT_H + 25;
  ctx.fillStyle = "#caf0f8";
  ctx.textAlign = "center";
  ctx.font = "20px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("📌 Reply 1-6 to Download • Type 'next' or 'prev' for more", W / 2, footerY);
  ctx.fillStyle = "#6c757d";
  ctx.font = "15px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Developer: Mueid Mursalin Rifat", W / 2, footerY + 30);
  ctx.textAlign = "left";

  return canvas.toBuffer("image/jpeg", { quality: 0.92 });
}

// -------------------- MODULE --------------------

module.exports = {
  config: {
    name: "ytb",
    aliases: ["youtube", "yt"],
    version: "2.0",
    author: "Mueid Mursalin Rifat",
    countDown: 5,
    role: 0,
    shortDescription: "🎵 YouTube downloader",
    longDescription: "Search and download YouTube audio (-a) or video (-v).",
    category: "media",
    guide: {
      en: "{pn} <query/link> -a (audio)\n{pn} <query/link> -v (video)\n\nExamples:\n{prefix}yt Believer -a\n{prefix}yt https://youtube.com/watch?v=... -v"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const raw = args.join(" ");
    if (!raw) return message.reply("❗ Use: yt <query/link> -a or -v");

    const isAudio = raw.includes("-a");
    const isVideo = raw.includes("-v");

    if (!isAudio && !isVideo)
      return message.reply("❗ Please use `-a` for audio or `-v` for video.");

    let videoQuality = 480;
    const qMatch = raw.match(/\b(144|240|360|480|720|1080)\b/);
    if (qMatch) videoQuality = parseInt(qMatch[1]);

    const query = raw.replace(/-a|-v|\b(144|240|360|480|720|1080)\b/g, "").trim();
    if (!query) return message.reply("❗ Please provide a search query or YouTube URL.");

    // Direct URL path
    if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(query)) {
      const wait = await message.reply(`⏳ Fetching metadata...`);
      try {
        const videoId = extractVideoId(query);
        let metadata = null;

        try {
          const { data } = await tryAllApis(`/api/yt?url=${encodeURIComponent(query)}&type=mp3&quality=128`);
          if (data && data.success && data.metadata) {
            metadata = {
              title: data.metadata.title || "YouTube Video",
              channel: data.metadata.author?.name || "N/A",
              duration: data.metadata.timestamp || "N/A",
              views: data.metadata.views || "0",
              thumbnail: data.metadata.thumbnail || data.metadata.image || ""
            };
          }
        } catch (e) {
          console.log("Metadata via API failed, falling back to yt-search:", e.message);
        }

        if (!metadata) {
          try {
            const searchResult = await yts(query);
            let videoInfo = null;
            if (searchResult && searchResult.videos && searchResult.videos.length > 0) {
              videoInfo = searchResult.videos[0];
            } else if (videoId) {
              const result = await yts({ videoId });
              if (result) videoInfo = result;
            }
            metadata = {
              title: videoInfo?.title || "YouTube Video",
              channel: videoInfo?.author?.name || "N/A",
              duration: videoInfo?.timestamp || "N/A",
              views: videoInfo?.views || "0",
              thumbnail: videoInfo?.thumbnail || ""
            };
          } catch (e) {
            console.log("yt-search fallback failed:", e.message);
          }
        }

        await api.unsendMessage(wait.messageID);
        const downloadWait = await message.reply(`⏳ Downloading ${isAudio ? "audio" : "video"}...`);
        await handleDownload(query, isAudio ? "audio" : "video", message, downloadWait.messageID, metadata, videoQuality);
      } catch (error) {
        console.error("Metadata fetch error:", error);
        try { await api.unsendMessage(wait.messageID); } catch (e) {}
        const downloadWait = await message.reply(`⏳ Downloading...`);
        await handleDownload(query, isAudio ? "audio" : "video", message, downloadWait.messageID, null, videoQuality);
      }
      return;
    }

    // Search path
    try {
      const res = await yts(query);
      const videos = res.videos.slice(0, 6);
      if (videos.length === 0) return message.reply("❌ No results found.");

      const imgBuffer = await generateSearchImage(videos, query, isAudio ? "audio" : "video", isVideo ? String(videoQuality) : "HD");
      const cachePath = path.join(__dirname, "cache", `yt_search_${Date.now()}.jpg`);
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(cachePath, imgBuffer);

      const sent = await message.reply({ attachment: fs.createReadStream(cachePath) });

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "yt",
        messageID: sent.messageID,
        author: event.senderID,
        data: videos,
        isAudio: isAudio,
        query: query,
        videoQuality: videoQuality
      });

      setTimeout(() => { if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); }, 10000);
    } catch (e) {
      console.error("Search error:", e);
      message.reply("⚠️ Failed to search YouTube.");
    }
  },

  onReply: async function ({ event, message, Reply, api }) {
    const { author, data, isAudio, messageID, videoQuality } = Reply;
    if (event.senderID !== author) return;

    const input = event.body.toLowerCase().trim();

    if (["next", "n", ">"].includes(input)) {
      return message.reply("📌 Only first 6 results shown. Try a more specific search.");
    }
    if (["prev", "p", "<"].includes(input)) {
      return message.reply("📌 This is the first page.");
    }

    const index = parseInt(event.body);
    if (isNaN(index) || index < 1 || index > data.length)
      return message.reply("❗ Reply with a number from 1–6.");

    const selected = data[index - 1];

    try { await api.unsendMessage(messageID); } catch (e) {}

    const wait = await message.reply(`⏳ Downloading ${isAudio ? "audio" : "video"}...`);

    const metadata = {
      title: selected.title,
      channel: selected.author?.name || "N/A",
      duration: selected.timestamp || "N/A",
      views: selected.views || "0",
      thumbnail: selected.thumbnail || ""
    };

    await handleDownload(selected.url, isAudio ? "audio" : "video", message, wait.messageID, metadata, videoQuality || 720);
  }
};

// -------------------- UTILS --------------------

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// -------------------- DOWNLOAD HANDLER --------------------

async function handleDownload(url, type, message, waitMsgID, metadata = null, videoQuality = 720) {
  try {
    const quality = type === "audio" ? 128 : videoQuality;
    const apiType = type === "audio" ? "mp3" : "mp4";

    const buildPath = `/api/yt?url=${encodeURIComponent(url)}&type=${apiType}&quality=${quality}`;

    const { data, base } = await tryAllApis(buildPath);

    if (!data || data.success !== true || !data.download || !data.download.downloadUrl) {
      throw new Error("API returned no download URL");
    }

    const downloadUrl = data.download.downloadUrl;

    if (!metadata) {
      const m = data.metadata || {};
      metadata = {
        title: m.title || "YouTube Media",
        duration: m.timestamp || "N/A",
        channel: m.author?.name || "N/A",
        views: m.views || "0",
        thumbnail: m.thumbnail || m.image || ""
      };
    }

    await downloadAndSendFile(downloadUrl, metadata, type, message, waitMsgID, base);

  } catch (err) {
    console.error("Download failed:", err.message);
    try { await message.unsend(waitMsgID); } catch (e) {}
    message.reply(`❌ Download failed: ${err.message}`);
  }
}

async function downloadAndSendFile(downloadUrl, metadata, type, message, waitMsgID, apiSource) {
  try {
    const fileExtension = type === "audio" ? "mp3" : "mp4";
    const fileName = `${Date.now()}.${fileExtension}`;
    const filePath = path.join(__dirname, "cache", fileName);

    fs.ensureDirSync(path.join(__dirname, "cache"));

    console.log("Downloading from:", downloadUrl);

    const res = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      }
    });

    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    try { await message.unsend(waitMsgID); } catch (e) {}

    const fileSize = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);

    const title = metadata?.title || "YouTube Media";
    const channel = metadata?.channel || "N/A";
    const duration = metadata?.duration || "N/A";
    const views = metadata?.views ? formatViews(metadata.views) : "N/A";

    let body = `🎵 ${title}\n`;
    body += `📺 Channel: ${channel}\n`;
    body += `⏱ Duration: ${duration}\n`;
    body += `👁 Views: ${views}\n`;
    body += `📦 Size: ${fileSize}MB\n`;
    body += `🔧 API: ${apiSource}\n\n`;
    body += `🔰 Made by Anik Islam Sadik`;

    await message.reply({
      body: body,
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Download and send error:", err.message);
    throw err;
  }
      }
