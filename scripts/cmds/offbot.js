module.exports = {
	config: {
		name: "offbot",
		version: "1.0",
		author: "Samir+modified by xalman",
		countDown: 45,
		role: 2,
		shortDescription: "Turn off bot",
		longDescription: "Turn off bot",
		category: "owner",
		guide: "{p}{n}"
	},
	onStart: async function ({event, api}) {
		api.sendMessage("📴Successfully Archives ✅",event.threadID, () =>process.exit(0))}
};
