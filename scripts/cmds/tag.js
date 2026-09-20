module.exports = {
  config: {
    name: "tag",
    alises: [],
    category: 'box chat',
    role: 0,
    author: 'dipto | Anik Islam Sadik',
    countDown: 3,
    description: { en: 'Tags a user to the provided name or message reply.' },
    guide: {
      en: `1. Reply to a message\n2. Use {pm}tag [name]\n3. Use {pm}tag [name] [message]`
    },
  },
  onStart: async ({ api, event, usersData, threadsData, args }) => {
    const { threadID, messageID, messageReply } = event;
    try {
      const d = await threadsData.get(threadID);
      const combined = d.members.map(gud => ({
        Name: gud.name,
        UserId: gud.userID
      }));

      let namesToTag = [];
      let extraMessage = "";
      let targetMessageID = messageID;

      if (messageReply) {
        targetMessageID = messageReply.messageID;
        const uid = messageReply.senderID;
        const name = await usersData.getName(uid);
        namesToTag.push({ Name: name, UserId: uid });
        extraMessage = args.join(' ');
      } else {
        if (args.length === 0) {
          return api.sendMessage('❌ Format: tag [name] or tag [name] [message]', threadID, messageID);
        }

        const input = args.join(' ');
        let searchName = "";
        
        if (input.includes('|')) {
          const parts = input.split('|');
          searchName = parts[0].trim().toLowerCase();
          extraMessage = parts.slice(1).join('|').trim();
        } else {
          searchName = args[0].toLowerCase();
          extraMessage = args.slice(1).join(' ').trim();
        }

        namesToTag = combined.filter(member =>
          member.Name.toLowerCase().includes(searchName)
        );

        if (namesToTag.length === 0) {
          return api.sendMessage('❌ User not found!', threadID, messageID);
        }
      }

      const mentions = [];
      const bodyParts = [];

      namesToTag.forEach(({ Name, UserId }) => {
        const taggedName = `@${Name}`;
        bodyParts.push(taggedName);
        mentions.push({
          tag: taggedName,
          id: UserId
        });
      });

      const bodyText = bodyParts.join(' ');
      const finalBody = extraMessage ? `${bodyText} - ${extraMessage}` : bodyText;

      return api.sendMessage({
        body: finalBody,
        mentions
      }, threadID, targetMessageID);

    } catch (e) {
      return api.sendMessage(e.message, threadID, messageID);
    }
  }
};
