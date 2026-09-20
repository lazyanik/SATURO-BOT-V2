module.exports = {
  config: {
    name: "approve",
    aliases: ["approved", "aprv", "apv"],
    version: "3.3",
    author: "Anik Islam Sadik",
    countDown: 5,
    role: 1,
    shortDescription: { en: "Approve pending group members" },
    category: "box chat",
    guide: { en: "{pn} | {pn} 1 | {pn} all" }
  },

  onStart: async ({ api, event, args, commandName }) => {
    const { threadID, messageID, senderID, isGroup } = event;
    if (!isGroup) return api.sendMessage("❌ This command can only be used in groups.", threadID, messageID);

    let info;
    try {
      info = await api.getThreadInfo(threadID);
    } catch (e) {
      return api.sendMessage("❌ Failed to retrieve thread info from Facebook.", threadID, messageID);
    }

    const queue = info?.approvalQueue || [];
    if (!queue.length) return api.sendMessage("✅ There are no pending members in this group.", threadID, messageID);

    const processApproval = async (targets, tid) => {
      const msg = await api.sendMessage(`⏳ Approving ${targets.length} member(s)...`, tid);
      let ok = 0, fail = 0;

      for (const user of targets) {
        const uid = String(user.requesterID || user.userID || user);
        let success = false;

        // 1. Try approveJoinRequest first
        if (typeof api.approveJoinRequest === "function") {
          try {
            await api.approveJoinRequest(uid, tid);
            success = true;
          } catch (e) {
            success = false;
          }
        }

        // 2. Fallback to addUserToGroup if first method failed
        if (!success && typeof api.addUserToGroup === "function") {
          try {
            await api.addUserToGroup(uid, tid);
            success = true;
          } catch (e) {
            success = false;
          }
        }

        if (success) {
          ok++;
        } else {
          fail++;
        }
      }

      const result = `✨ Done: ${ok} member(s) approved ✅\n❌ Failed: ${fail} member(s) ❎`;

      try {
        await api.editMessage(result, msg.messageID);
      } catch {
        await api.sendMessage(result, tid);
        try { await api.unsendMessage(msg.messageID); } catch {}
      }
    };

    if (args.length > 0) {
      if (/^all$/i.test(args[0])) return processApproval(queue, threadID);

      const targets = [];
      for (const n of args) {
        const num = parseInt(n, 10);
        if (isNaN(num) || num < 1 || num > queue.length) {
          return api.sendMessage(`❌ Invalid number provided: ${n}`, threadID, messageID);
        }
        const selectedUser = queue[num - 1];
        if (!targets.some(t => (t.requesterID || t.userID) === (selectedUser.requesterID || selectedUser.userID))) {
          targets.push(selectedUser);
        }
      }
      return processApproval(targets, threadID);
    }

    let names = {};
    try {
      const uIDs = queue.map(x => String(x.requesterID || x.userID || x));
      names = await api.getUserInfo(uIDs);
    } catch {}

    const numbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

    const list = queue.map((x, i) => {
      const targetID = String(x.requesterID || x.userID || x);
      const userName = names?.[targetID]?.name || "Facebook User";
      const numSymbol = numbers[i] || `(${i + 1})`;
      return `┃ ${numSymbol} ${userName}\n┃ 🆔 "${targetID}"`;
    }).join("\n┃\n");

    const messageText = 
`╭─〔 📝 PENDING MEMBERS 〕─╮
┃ 👤 Requests: ${queue.length}
┃
${list}
╰━━━━━━━━━━━━━━━━━━╯

📌 APPROVAL OPTIONS

➤ Reply "1" → Approve Member 1
➤ Reply "2" → Approve Member 2
➤ Reply "1 2" → Approve Selected Members
➤ Reply "all" → Approve All Members

⚡ Select an option to continue...`;

    return api.sendMessage(
      messageText,
      threadID,
      (err, m) => {
        if (!err && global.GoatBot?.onReply) {
          global.GoatBot.onReply.set(m.messageID, {
            commandName,
            author: senderID,
            queue,
            messageID: m.messageID
          });
        }
      },
      messageID
    );
  },

  onReply: async ({ api, event, Reply }) => {
    if (event.senderID !== Reply.author) return;

    const input = event.body.trim();
    let targets = [];

    if (global.GoatBot?.onReply && Reply.messageID) {
      global.GoatBot.onReply.delete(Reply.messageID);
    }

    if (/^all$/i.test(input)) {
      targets = Reply.queue;
    } else {
      const parts = input.split(/\s+/);
      const uniqueIndices = [...new Set(parts)];

      for (const n of uniqueIndices) {
        const num = parseInt(n, 10);
        if (isNaN(num) || num < 1 || num > Reply.queue.length) {
          return api.sendMessage(`❌ Invalid number in reply: ${n}`, event.threadID, event.messageID);
        }
        targets.push(Reply.queue[num - 1]);
      }
    }

    const msg = await api.sendMessage(
      `⏳ Approving ${targets.length} member(s)...`,
      event.threadID
    );

    let ok = 0, fail = 0;

    for (const user of targets) {
      const uid = String(user.requesterID || user.userID || user);
      let success = false;

      if (typeof api.approveJoinRequest === "function") {
        try {
          await api.approveJoinRequest(uid, event.threadID);
          success = true;
        } catch (e) {
          success = false;
        }
      }

      if (!success && typeof api.addUserToGroup === "function") {
        try {
          await api.addUserToGroup(uid, event.threadID);
          success = true;
        } catch (e) {
          success = false;
        }
      }

      if (success) {
        ok++;
      } else {
        fail++;
      }
    }

    const result = `✨ Done: ${ok} member(s) approved ✅\n❌ Failed: ${fail} member(s) ❎`;

    try {
      await api.editMessage(result, msg.messageID);
    } catch {
      await api.sendMessage(result, event.threadID);
      try { await api.unsendMessage(msg.messageID); } catch {}
    }
  }
};
