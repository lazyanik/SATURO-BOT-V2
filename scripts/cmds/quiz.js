const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "quiz",
                aliases: ["qz"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "সাধারণ জ্ঞান কুইজ খেলে কয়েন এবং এক্সপি জিতুন",
                        en: "Play general knowledge quiz to win coins and exp",
                        vi: "Chơi trò chơi đố vui kiến thức để giành được xu và exp"
                },
                category: "game",
                guide: {
                        bn: '   {pn} en: ইংরেজি কুইজ\n   {pn} bn: বাংলা কুইজ',
                        en: '   {pn} en: English quiz\n   {pn} bn: Bangla quiz',
                        vi: '   {pn} en: Câu đố tiếng Anh\n   {pn} bn: Câu đố tiếng Bengal'
                }
        },

        langs: {
                bn: {
                        reply: "𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.",
                        correct: "✅ | একদম সঠিক উত্তর বেবি!\n\nতুমি জিতেছো %1 কয়েন এবং %2 এক্সপি।",
                        wrong: "❌ | উত্তরটি ভুল হয়েছে বেবি!\n\nসঠিক উত্তর ছিল: %1",
                        notYour: "× বেবি, এটি তোমার কুইজ নয়! নিজের জন্য শুরু করো। >🐸",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        reply: "𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.",
                        correct: "✅ | Correct answer baby!\n\nYou earned %1 coins & %2 exp.",
                        wrong: "❌ | Wrong answer baby!\n\nThe correct answer was: %1",
                        notYour: "𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐛𝐚𝐛𝐲 >🐸",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        reply: "Trả lời bằng đáp án của bạn đi cưng",
                        correct: "✅ | Đáp án chính xác cưng ơi!\n\nBạn nhận được %1 xu & %2 exp.",
                        wrong: "❌ | Sai rồi cưng ơi!\n\n💡 Đáp án đúng là: %1",
                        notYour: "× Đây không phải câu đố của bạn cưng à! >🐸",
                        error: "× Lỗi: %1. Liên hệ MahMUD để được hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68); 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }
                
                try {
                        const input = args.join("").toLowerCase();
                        const category = input === "en" || input === "english" ? "english" : "bangla";

                        const apiUrl = await mahmud();
                        const res = await axios.get(`${apiUrl}/api/quiz?category=${category}`);
                        const quiz = res.data;

                        if (!quiz) return api.sendMessage("× No quiz available baby.", event.threadID, event.messageID);

                        const { question, correctAnswer, options } = quiz;
                        const { a, b, c, d } = options;

                        const quizMsg = `\n╭──✦ ${question}\n`
                                + `├‣ 𝗔) ${a}\n`
                                + `├‣ 𝗕) ${b}\n`
                                + `├‣ 𝗖) ${c}\n`
                                + `├‣ 𝗗) ${d}\n`
                                + `╰──────────────────‣\n`
                                + `${getLang("reply")}`;

                        api.sendMessage(quizMsg, event.threadID, (error, info) => {
                                global.GoatBot.onReply.set(info.messageID, {
                                        type: "reply",
                                        commandName: this.config.name,
                                        author: event.senderID,
                                        messageID: info.messageID,
                                        correctAnswer
                                });

                                setTimeout(() => {
                                        api.unsendMessage(info.messageID);
                                }, 40000);
                        }, event.messageID);

                } catch (error) {
                        api.sendMessage(getLang("error", error.message), event.threadID, event.messageID);
                }
        },

        onReply: async function ({ event, api, Reply, usersData, getLang }) {
                const { correctAnswer, author } = Reply;
                if (event.senderID !== author) return api.sendMessage(getLang("notYour"), event.threadID, event.messageID);

                const userReply = event.body.trim().toLowerCase();
                const userData = await usersData.get(author);
                const rewardCoins = 500;
                const rewardExp = 121;

                await api.unsendMessage(Reply.messageID);

                if (userReply === correctAnswer.toLowerCase()) {
                        await usersData.set(author, {
                                money: userData.money + rewardCoins,
                                exp: userData.exp + rewardExp,
                                data: userData.data
                        });
                        return api.sendMessage(getLang("correct", rewardCoins, rewardExp), event.threadID, event.messageID);
                } else {
                        return api.sendMessage(getLang("wrong", correctAnswer), event.threadID, event.messageID);
                }
        }
};
