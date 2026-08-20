module.exports = {
  config: {
    name: "listbox",
    aliases: ["grouplist", "listgroup"],
    author: "Anik Islam Sadik",
    version: "2.7",
    cooldowns: 5,
    role: 2,
    shortDescription: { en: "List all groups with pagination and control options." },
    longDescription: { en: "List all group chats the bot is in with options to leave or join." },
    category: "GROUP",
    guide: { en: "{p}{n} [page_number]" }
  },

  onStart: async function ({ api, event, args, commandName }) {
    try {
      const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
      const filteredList = allThreads.filter(group => group.isGroup === true);

      if (filteredList.length === 0) {
        return api.sendMessage("No group chats found.", event.threadID);
      }

      const page = parseInt(args[0]) || 1;
      const limit = 10;
      const totalPages = Math.ceil(filteredList.length / limit);

      const msg = getPageMessage(filteredList, page, limit, totalPages);

      return api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          allGroups: filteredList,
          page: page
        });
      }, event.messageID);

    } catch (error) {
      console.error("Error in listbox:", error);
      api.sendMessage("Error fetching group list.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, commandName }) {
    const { author, allGroups, page, messageID } = Reply;
    
    if (event.senderID !== author) return;

    const input = event.body.trim();
    const args = input.split(/\s+/);
    const action = args[0].toLowerCase();

    const limit = 10;
    const totalPages = Math.ceil(allGroups.length / limit);

    if (action === "left" || action === "out") {
      const indexes = args.slice(1).map(n => parseInt(n)).filter(n => !isNaN(n));
      if (indexes.length === 0) {
        return api.sendMessage("⚠️ Please provide group number(s). Example: left 1 or left 1 2 3", event.threadID, event.messageID);
      }

      let leftCount = 0;
      for (const index of indexes) {
        const groupIndex = (page - 1) * limit + (index - 1);
        if (groupIndex >= 0 && groupIndex < allGroups.length) {
          const targetGroup = allGroups[groupIndex];
          try {
            await api.removeUserFromGroup(api.getCurrentUserID(), targetGroup.threadID);
            leftCount++;
          } catch (e) {
            console.error(`Failed to leave thread ${targetGroup.threadID}:`, e);
          }
        }
      }
      return api.sendMessage(`✅ Left ${leftCount} group(s) successfully.`, event.threadID, event.messageID);
    }

    if (action === "join") {
      const index = parseInt(args[1]);
      if (isNaN(index)) {
        return api.sendMessage("⚠️ Please provide a group number. Example: join 1", event.threadID, event.messageID);
      }

      const groupIndex = (page - 1) * limit + (index - 1);
      if (groupIndex < 0 || groupIndex >= allGroups.length) {
        return api.sendMessage("⚠️ Invalid group number!", event.threadID, event.messageID);
      }

      const targetGroup = allGroups[groupIndex];
      const targetName = targetGroup.threadName || targetGroup.name || "Group";

      try {
        const threadInfo = await api.getThreadInfo(targetGroup.threadID);
        await api.addUserToGroup(event.senderID, targetGroup.threadID);

        if (threadInfo.approvalMode) {
          return api.sendMessage(`⚠️ The group's approval feature is on. The admin will approve you. You are on the pending list.`, event.threadID, event.messageID);
        } else {
          return api.sendMessage(`✅ You have been added to "${targetName}"!`, event.threadID, event.messageID);
        }
      } catch (err) {
        console.error("Join error:", err);
        return api.sendMessage(`❌ Failed to add you to "${targetName}". Please check your privacy settings or bot permissions.`, event.threadID, event.messageID);
      }
    }

    let newPage = page;
    if (action === "next") {
      newPage = page + 1;
    } else if (action === "back") {
      newPage = page - 1;
    } else if (!isNaN(action)) {
      newPage = parseInt(action);
    } else {
      return;
    }

    if (newPage > totalPages || newPage < 1) {
      return api.sendMessage(`Invalid page! Please choose between 1 and ${totalPages}`, event.threadID, event.messageID);
    }

    const msg = getPageMessage(allGroups, newPage, limit, totalPages);

    api.unsendMessage(messageID);

    return api.sendMessage(msg, event.threadID, (err, info) => {
      if (err) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
        allGroups: allGroups,
        page: newPage
      });
    }, event.messageID);
  }
};

function getPageMessage(groups, page, limit, totalPages) {
  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedGroups = groups.slice(start, end);

  let message = `╭──────╮\n│ 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓\n├──────┤\n`;
  pagedGroups.forEach((group, index) => {
    const groupName = group.threadName || group.name || "Unnamed Group";
    message += `│${index + 1}. ${groupName}\n│𝐓𝐈𝐃: ${group.threadID}\n├──────┤\n`;
  });
  message += `│ Page: ${page}/${totalPages}\n╰──────╯\n\n💡 Reply with:\n"next" - Next page\n"back" - Previous page\n"left [num]" - Leave group (e.g. left 1)\n"join [num]" - Add you to group (e.g. join 1)`;
  return message;
                       }
