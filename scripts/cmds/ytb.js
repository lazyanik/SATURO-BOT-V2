const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ytb",
                aliases: ["youtube", "yt"],
                version: "2.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        vi: "Tải video, audio hoặc xem thông tin video trên YouTube",
                        en: "Download video, audio or view video information on YouTube"
                },
                category: "media",
                guide: {
                        vi: "   {pn} [video|-v] [<tên video>|<link video>]: dùng để tải video từ youtube."
                                + "\n   {pn} [audio|-a] [<tên video>|<link video>]: dùng để tải audio từ youtube"
                                + "\n   {pn} [info|-i] [<tên video>|<link video>]: dùng để xem thông tin video từ youtube"
                                + "\n   Ví dụ:"
                                + "\n    {pn} -v Mood Lo-Fi"
                                + "\n    {pn} -a Mood Lo-Fi"
                                + "\n    {pn} -i Mood Lo-Fi",
                        en: "   {pn} [video|-v] [<video name>|<video link>]: use to download video from youtube."
                                + "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from youtube"
                                + "\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from youtube"
                                + "\n   Example:"
                                + "\n    {pn} -v Mood Lo-Fi"
                                + "\n    {pn} -a Mood Lo-Fi"
                                + "\n    {pn} -i Mood Lo-Fi"
                }
        },

        langs: {
                vi: {
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139",
                        noResult: "⭕ Không có kết quả tìm kiếm nào phù hợp với từ khóa %1",
                        choose: "%1Reply tin nhắn với số để chọn hoặc nội dung bất kì để gỡ",
                        video: "video",
                        audio: "âm thanh",
                        downloading: "⬇️ Đang tải xuống %1 \"%2\"",
                        noVideo: "⭕ Rất tiếc, không tìm thấy video nào hợp lệ",
                        noAudio: "⭕ Rất tiếc, không tìm thấy audio nào hợp lệ",
                        info: "💠 Tiêu đề: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Thời gian video: %4\n👀 Lượt xem: %5\n👍 Lượt thích: %6\n🆙 Ngày tải lên: %7\n🔠 ID: %8\n🔗 Link: %9"
                },
                en: {
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139",
                        noResult: "⭕ No search results match the keyword",
                        choose: "%1Reply to the message with a number to choose or any content to cancel",
                        video: "video",
                        audio: "audio",
                        downloading: "⬇️ Downloading %1 \"%2\"",
                        noVideo: "⭕ Sorry, no video was found",
                        noAudio: "⭕ Sorry, no audio was found",
                        info: "💠 Title: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Video duration: %4\n👀 View count: %5\n👍 Like count: %6\n🆙 Upload date: %7\n🔠 ID: %8\n🔗 Link: %9"
                }
        },

        onStart: async function ({ api, args, message, event, commandName, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68); 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }
                
                const { threadID, messageID, senderID } = event;
                
                let type;
                switch (args[0]) {
                        case "-v":
                        case "video":
                                type = "video";
                                break;
                        case "-a":
                        case "-s":
                        case "audio":
                        case "sing":
                                type = "audio";
                                break;
                        case "-i":
                        case "info":
                                type = "info";
                                break;
                        default:
                                return message.SyntaxError();
                }

                const input = args.slice(1).join(" ");
                if (!input) return message.SyntaxError();

                const apiUrl = await baseApiUrl();
                const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
                
                if (checkurl.test(input)) {
                        const videoID = input.match(checkurl)[1];
                        api.setMessageReaction("🐤", messageID, () => {}, true);
                        if (type === 'info') return fetchInfo(api, threadID, messageID, videoID, apiUrl, getLang);
                        return handleDownload(api, threadID, messageID, videoID, type, apiUrl, getLang);
                }

                try {
                        api.setMessageReaction("🐤", messageID, () => {}, true);
                        const res = await axios.get(`${apiUrl}/api/ytb/search?q=${encodeURIComponent(input)}`);
                        const results = res.data.results.slice(0, 6);
                        if (!results || results.length === 0) return api.sendMessage(getLang("noResult", input), threadID, messageID);

                        let msg = "";
                        const attachments = [];
                        const cacheDir = path.join(__dirname, 'cache');
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

                        for (let i = 0; i < results.length; i++) {
                                msg += `${i + 1}. ${results[i].title}\nTime: ${results[i].time}\nChannel: ${results[i].channel.name || results[i].channel}\n\n`;
                                const thumbPath = path.join(cacheDir, `thumb_${senderID}_${Date.now()}_${i}.jpg`);
                                const thumbRes = await axios.get(results[i].thumbnail, { responseType: 'arraybuffer' });
                                fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
                                attachments.push(fs.createReadStream(thumbPath));
                        }

                        return api.sendMessage({
                                body: getLang("choose", msg),
                                attachment: attachments
                        }, threadID, (err, info) => {
                                attachments.forEach(stream => { if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path); });
                                global.GoatBot.onReply.set(info.messageID, { 
                                        commandName, 
                                        author: senderID, 
                                        results, 
                                        type, 
                                        apiUrl,
                                        menuMessageID: info.messageID 
                                });
                        }, messageID);

                } catch (e) {
                        return api.sendMessage(getLang("error", e.message), threadID, messageID);
                }
        },

        onReply: async function ({ event, api, Reply, getLang }) {
                const { results, type, apiUrl, author, menuMessageID } = Reply;
                if (event.senderID !== author) return;
                
                const targetMessageID = menuMessageID || Reply.messageID;
                
                const choice = parseInt(event.body);
                if (isNaN(choice) || choice <= 0 || choice > results.length) {
                        return api.unsendMessage(targetMessageID);
                }
                
                const videoID = results[choice - 1].id;
                
                api.unsendMessage(targetMessageID);
                api.setMessageReaction("⌛", event.messageID, () => {}, true);
               
                if (type === 'info') return fetchInfo(api, event.threadID, event.messageID, videoID, apiUrl, getLang);
                await handleDownload(api, event.threadID, event.messageID, videoID, type, apiUrl, getLang);
        }
};

async function handleDownload(api, threadID, messageID, videoID, type, apiUrl, getLang) {
        const format = type === 'audio' ? 'mp3' : 'mp4';
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        const filePath = path.join(cacheDir, `yt_${Date.now()}.${format}`);

        try {
                const res = await axios.get(`${apiUrl}/api/ytb/get?id=${videoID}&type=${type}`);
                const { title, downloadLink } = res.data.data;
                
                api.sendMessage(getLang("downloading", getLang(type), title), threadID, messageID);
                
                const response = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on('finish', () => {
                        api.sendMessage({
                                body: title,
                                attachment: fs.createReadStream(filePath)
                        }, threadID, () => { 
                                api.setMessageReaction("✅", messageID, () => {}, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
                        }, messageID);
                });
                
                writer.on('error', (err) => {
                        throw err;
                });
        } catch (e) {
                api.sendMessage(getLang("error", "Download failed!"), threadID, messageID);
        }
}

async function fetchInfo(api, threadID, messageID, videoID, apiUrl, getLang) {
        try {
                const res = await axios.get(`${apiUrl}/api/ytb/details?id=${videoID}`);
                const d = res.data.details;
                
                const formatNum = (num) => String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                
                const msg = getLang("info", 
                        d.title, d.channel, formatNum(d.subCount || 0), d.duration_raw || d.duration, 
                        formatNum(d.view_count || 0), formatNum(d.like_count || 0), d.upload_date || 'N/A', videoID, d.webpage_url
                );

                const cacheDir = path.join(__dirname, 'cache');
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

                const thumbPath = path.join(cacheDir, `info_${videoID}.jpg`);
                const thumbRes = await axios.get(d.thumbnail, { responseType: 'arraybuffer' });
                fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
                
                api.sendMessage({ body: msg, attachment: fs.createReadStream(thumbPath) }, 
                        threadID, () => { 
                                api.setMessageReaction("✅", messageID, () => {}, true);
                                if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath); 
                        }, messageID);
        } catch (e) {
                api.sendMessage(getLang("error", e.message), threadID, messageID);
        }
          }
