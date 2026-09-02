module.exports = {
	config: {
		name: "count",
		version: "2.1",
		author: "NTKhang | Upgrade by Toshiro Editz",
		countDown: 5,
		role: 0,
		description: {
			en: "View message count of group members"
		},
		category: "box chat",
		guide: {
			en:
				"{pn} - Your all-time count" +
				"\n{pn} all - All-time ranking" +
				"\n{pn} daily - Daily ranking" +
				"\n{pn} monthly - Monthly ranking" +
				"\n{pn} @tag - Mentioned user's count"
		}
	},

	langs: {
		en: {
			allTitle: "🏆 ALL-TIME MESSAGE COUNT",
			dailyTitle: "📆 DAILY MESSAGE COUNT",
			monthlyTitle: "📅 MONTHLY MESSAGE COUNT",

			your: "💬 Your %1 messages: %2",

			userAll: "💬 %1 is ranked #%2 with %3 messages",
			userDaily: "📆 %1 is ranked #%2 with %3 messages today",
			userMonthly: "📅 %1 is ranked #%2 with %3 messages this month",

			page: "━━━━━━━━━━━━━━━━━━\n📄 Page %1/%2",
			reply: "↩️ Reply with a page number to continue",
			invalid: "❌ Invalid page number.",
			notFound: "❌ User not found."
		}
	},

	onStart: async function ({
		args,
		threadsData,
		message,
		event,
		api,
		commandName,
		getLang
	}) {
		const { threadID, senderID } = event;

		let members = await threadsData.get(
			threadID,
			"members"
		) || [];

		const threadInfo = await api.getThreadInfo(threadID);
		const participantIDs = (
			threadInfo.participantIDs || []
		).map(String);

		const now = Date.now();
		const monthKey = getMonthKey();

		for (const uid of participantIDs) {
			if (!members.some(user =>
				String(user.userID) === uid
			)) {
				let name = "Unknown";

				try {
					const info = await api.getUserInfo(uid);
					name = info[uid]?.name || "Unknown";
				} catch {}

				members.push({
					userID: uid,
					name,

					count: 0,

					dailyCount: 0,
					dailyResetAt: now + DAY,

					monthlyCount: 0,
					monthlyKey: monthKey
				});
			}
		}

		members = members.filter(user =>
			participantIDs.includes(
				String(user.userID)
			)
		);

		for (const user of members) {
			user.count = Number(user.count || 0);
			user.dailyCount = Number(
				user.dailyCount || 0
			);
			user.monthlyCount = Number(
				user.monthlyCount || 0
			);

			if (
				!user.dailyResetAt ||
				now >= Number(user.dailyResetAt)
			) {
				user.dailyCount = 0;
				user.dailyResetAt = now + DAY;
			}

			if (user.monthlyKey !== monthKey) {
				user.monthlyCount = 0;
				user.monthlyKey = monthKey;
			}
		}

		await threadsData.set(
			threadID,
			members,
			"members"
		);

		const mode = getMode(args[0]);

		if (!args[0]) {
			const user = members.find(
				user =>
					String(user.userID) ===
					String(senderID)
			);

			return message.reply(
				getLang(
					"your",
					"all-time",
					user?.count || 0
				)
			);
		}

		if (
			event.mentions &&
			Object.keys(event.mentions).length
		) {
			const ranking = createRanking(
				members,
				mode
			);

			let msg = "";

			for (const uid of Object.keys(
				event.mentions
			)) {
				const user = ranking.find(
					user =>
						String(user.userID) ===
						String(uid)
				);

				if (!user) {
					msg += `\n${getLang(
						"notFound"
					)}`;
					continue;
				}

				const key =
					mode === "daily"
						? "userDaily"
						: mode === "monthly"
							? "userMonthly"
							: "userAll";

				msg += `\n${getLang(
					key,
					user.name,
					user.rank,
					user.count
				)}`;
			}

			return message.reply(msg);
		}

		const ranking = createRanking(
			members,
			mode
		);

		const pages = splitPages(
			ranking,
			50
		);

		return sendPage({
			message,
			commandName,
			author: senderID,
			pages,
			page: 1,
			mode,
			getLang
		});
	},

	onReply: async function ({
		message,
		event,
		Reply,
		getLang
	}) {
		if (
			String(event.senderID) !==
			String(Reply.author)
		)
			return;

		const page = parseInt(
			event.body
		);

		if (
			isNaN(page) ||
			page < 1 ||
			page > Reply.pages.length
		) {
			return message.reply(
				getLang("invalid")
			);
		}

		message.unsend(
			Reply.messageID
		);

		return sendPage({
			message,
			commandName: Reply.commandName,
			author: Reply.author,
			pages: Reply.pages,
			page,
			mode: Reply.mode,
			getLang
		});
	},

	onChat: async function ({
		usersData,
		threadsData,
		event
	}) {
		const {
			threadID,
			senderID
		} = event;

		if (!threadID || !senderID)
			return;

		let members = await threadsData.get(
			threadID,
			"members"
		) || [];

		const now = Date.now();
		const monthKey = getMonthKey();

		let user = members.find(
			user =>
				String(user.userID) ===
				String(senderID)
		);

		if (!user) {
			let name = "Unknown";

			try {
				const data =
					await usersData.get(senderID);

				name =
					data?.name ||
					"Unknown";
			} catch {}

			user = {
				userID: senderID,
				name,

				count: 0,

				dailyCount: 0,
				dailyResetAt:
					now + DAY,

				monthlyCount: 0,
				monthlyKey: monthKey
			};

			members.push(user);
		}

		user.count = Number(
			user.count || 0
		);

		user.dailyCount = Number(
			user.dailyCount || 0
		);

		user.monthlyCount = Number(
			user.monthlyCount || 0
		);

		if (
			!user.dailyResetAt ||
			now >= Number(
				user.dailyResetAt
			)
		) {
			user.dailyCount = 0;
			user.dailyResetAt =
				now + DAY;
		}

		if (
			user.monthlyKey !==
			monthKey
		) {
			user.monthlyCount = 0;
			user.monthlyKey =
				monthKey;
		}

		user.count++;
		user.dailyCount++;
		user.monthlyCount++;

		await threadsData.set(
			threadID,
			members,
			"members"
		);
	}
};

const DAY = 24 * 60 * 60 * 1000;

function getMonthKey() {
	const date = new Date();

	return `${date.getFullYear()}-${String(
		date.getMonth() + 1
	).padStart(2, "0")}`;
}

function getMode(arg) {
	arg = String(
		arg || ""
	).toLowerCase();

	if (arg === "daily")
		return "daily";

	if (arg === "monthly")
		return "monthly";

	return "all";
}

function createRanking(
	members,
	mode
) {
	const ranking = members.map(
		user => {
			let count;

			if (mode === "daily") {
				count =
					Number(
						user.dailyCount ||
						0
					);
			} else if (
				mode === "monthly"
			) {
				count =
					Number(
						user.monthlyCount ||
						0
					);
			} else {
				count =
					Number(
						user.count ||
						0
					);
			}

			return {
				userID:
					user.userID,
				name:
					user.name ||
					`Uid: ${user.userID}`,
				count
			};
		}
	);

	ranking.sort(
		(a, b) =>
			b.count - a.count
	);

	ranking.forEach(
		(user, index) => {
			user.rank =
				index + 1;
		}
	);

	return ranking;
}

function splitPages(
	array,
	size
) {
	const pages = [];

	for (
		let i = 0;
		i < array.length;
		i += size
	) {
		pages.push(
			array.slice(
				i,
				i + size
			)
		);
	}

	return pages.length
		? pages
		: ;
}

function getTitle(
	mode,
	getLang
) {
	if (mode === "daily")
		return getLang(
			"dailyTitle"
		);

	if (mode === "monthly")
		return getLang(
			"monthlyTitle"
		);

	return getLang(
		"allTitle"
	);
}

function sendPage({
	message,
	commandName,
	author,
	pages,
	page,
	mode,
	getLang
}) {
	let msg = getTitle(
		mode,
		getLang
	);

	for (
		const user of pages[
			page - 1
		]
	) {
		msg += `\n${user.rank}/ ${user.name}: ${user.count}`;
	}

	msg += "\n" + getLang(
		"page",
		page,
		pages.length
	);

	if (page < pages.length) {
		msg += "\n" +
			getLang("reply");
	}

	return message.reply(
		msg,
		(err, info) => {
			if (err)
				return message.err(
					err
				);

			if (
				page <
				pages.length
			) {
				global.GoatBot.onReply.set(
					info.messageID,
					{
						commandName,
						messageID:
							info.messageID,
						author,
						pages,
						mode
					}
				);
			}
		}
	);
}
