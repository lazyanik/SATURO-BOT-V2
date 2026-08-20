module.exports = {
  config: {
    name: "autoreact",
    version: "5.1.0",
    author: "Anik Islam Sadik",
    role: 0,
    category: "system",
    shortDescription: "Auto react with ON/OFF control",
    longDescription: "Automatic emoji reaction with per-thread ON/OFF control"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const threadID = event.threadID;
      if (!threadID) return;

      global.__autoReactStatus ??= {};

      const action = (args[0] || "").toLowerCase();

      let message;

      if (!action) {
        const status = global.__autoReactStatus[threadID] !== false;

        message = await api.sendMessage(
          `🤖 AutoReact: ${status ? "ON 🟢" : "OFF 🔴"}`,
          threadID
        );
      } else if (action === "on") {
        global.__autoReactStatus[threadID] = true;

        message = await api.sendMessage(
          "✅ AutoReact ON",
          threadID
        );
      } else if (action === "off") {
        global.__autoReactStatus[threadID] = false;

        message = await api.sendMessage(
          "🔴 AutoReact OFF",
          threadID
        );
      } else {
        message = await api.sendMessage(
          "❌ Use: autoreact on / autoreact off",
          threadID
        );
      }

      if (message?.messageID) {
        setTimeout(() => {
          api.unsendMessage(message.messageID).catch(() => {});
        }, 1500);
      }

    } catch (e) {
      console.error("AutoReact command error:", e);
    }
  },

  onChat: async function ({ api, event }) {
    try {
      const {
        messageID,
        body,
        senderID,
        threadID
      } = event;

      if (!messageID || !body || !threadID) return;
      if (senderID === api.getCurrentUserID()) return;

      global.__autoReactStatus ??= {};

      if (global.__autoReactStatus[threadID] === false) return;

      global.__autoReactCooldown ??= {};

      if (
        global.__autoReactCooldown[threadID] &&
        Date.now() - global.__autoReactCooldown[threadID] < 2500
      ) {
        return;
      }

      global.__autoReactCooldown[threadID] = Date.now();

      const text = body.toLowerCase();
      let react = null;

      const categories = [
        { e: ["😂","🤣","😆","😄","😁"], r: "😆" },
        { e: ["😭","😢","🥺","💔"], r: "😢" },
        { e: ["❤️","💖","💘","🥰","😍"], r: "❤️" },
        { e: ["😡","🤬"], r: "😡" },
        { e: ["😮","😱","😲"], r: "😮" },
        { e: ["😎","🔥","💯"], r: "😎" },
        { e: ["👍","👌","🙏"], r: "👍" },
        { e: ["🖕","🥒","👃"], r: "🖕" },
        { e: ["🎉","🥳"], r: "🎉" }
      ];

      const texts = [
        { k: ["haha","lol","moja","xd","bal"], r: "😆" },
        { k: ["sad","kharap","kosto","mon kharap","cry"], r: "😢" },
        { k: ["love","valobasi","miss","alya","hinata","baby","bot","jan","bby"], r: "🥹" },
        { k: ["rag","angry","rage"], r: "😡" },
        { k: ["wow","omg"], r: "😮" },
        { k: ["prefix"], r: "🤖" },
        { k: ["ok","yes","okay","hmm"], r: "✅" },
        { k: ["cmd"], r: "🔖" },
        { k: ["cdi","fuck","xdi","fk","chudi"], r: "🖕" },
        { k: ["hlw","hellow","hey"], r: "😸" },
        { k: ["fork","repo","repository"], r: "🍴" },
        { k: ["alhamdulillah","valo","sweet","cute","beautiful"], r: "🥰" },
        { k: ["birthday","birth","cake","happy birthday"], r: "🎂" },
        { k: ["thanks","tnx","thank you","wlc","welcome"], r: "🦋" },
        { k: ["good night","night","gn"], r: "💤" },
        { k: ["good morning","morning","gm"], r: "🥱" }
      ];

      for (const c of categories) {
        if (c.e.some(x => text.includes(x))) {
          react = c.r;
          break;
        }
      }

      if (!react) {
        for (const t of texts) {
          if (t.k.some(x => text.includes(x))) {
            react = t.r;
            break;
          }
        }
      }

      if (!react) return;

      await new Promise(resolve => setTimeout(resolve, 800));

      if (global.__autoReactStatus[threadID] === false) return;

      await api.setMessageReaction(
        react,
        messageID,
        threadID
      );

    } catch (e) {
      console.error("AutoReact error:", e.message || e);
    }
  }
};
