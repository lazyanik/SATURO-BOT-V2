<div align="center">

<img src="https://raw.githubusercontent.com/lazyanik/SATURO-BOT-V2/main/assets/header-hearts.svg" width="100%" alt="SATURO BOT V2 Header">

<img src="https://i.ibb.co/RQ28H2p/banner.png" alt="SATURO BOT V2 Banner">

<h1>
  <img src="./dashboard/images/logo-non-bg.png" width="24px">
  SATURO BOT V2 — Enhanced Edition
</h1>

<a href="https://github.com/lazyanik/SATURO-BOT-V2">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=800&color=A78BFA&center=true&vCenter=true&width=700&lines=A+feature-rich+Facebook+Messenger+bot+framework;Web+dashboard+%2B+MongoDB+%2F+SQLite+support;Modern+%E2%9A%A1+Hardened+%F0%9F%9B%A1%EF%B8%8F+Fast+%F0%9F%9A%80+Customizable+%F0%9F%8E%A8" alt="Typing animation">
</a>

<p>
  <em>A feature-rich Facebook Messenger bot framework with a web dashboard, built on an unofficial Messenger API.</em>
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-22.x-brightgreen.svg?style=flat-square" alt="Node.js 22.x">
  <img alt="version" src="https://img.shields.io/badge/dynamic/json?color=a78bfa&label=version&prefix=v&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Flazyanik%2FSATURO-BOT-V2%2Fmain%2Fpackage.json&style=flat-square&cacheSeconds=300">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-green?style=flat-square">
  <img alt="platform" src="https://img.shields.io/badge/platform-Node.js%20%7C%20Docker-informational?style=flat-square">
</p>

<p>
  <sub>
    Maintained fork of
    <a href="https://github.com/ntkhang03/Goat-Bot-V2">Goat-Bot-V2</a>
    by <b>NTKhang</b>.
    <br>
    <b>Modified & enhanced by
    <a href="https://github.com/lazyanik">Anik Islam Sadik</a>
    (@lazyanik) 🕊️</b>
  </sub>
</p>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="divider">

</div>

## 📖 Overview

**SATURO BOT V2 — Enhanced Edition** is a self-hosted Messenger chat-bot framework built around the Goat-Bot-V2 architecture.

It connects through an unofficial Messenger API, provides a full command/event system, and includes a web dashboard with MongoDB/SQLite support for managing threads, users and runtime configuration.

This fork focuses on production readiness, stability, safer database handling, modern dependencies and useful quality-of-life features.

<div align="center">

**⚡ Modern** • **🛡️ Hardened** • **🚀 Fast** • **🎨 Customizable**

</div>

---

## 📚 Table of Contents

- [✨ Enhanced Features](#-enhanced-features-in-this-fork)
- [🚧 Requirements](#-requirements)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🚀 Running the Bot](#-running-the-bot)
- [💡 How It Works](#-how-it-works)
- [🛠️ Creating New Commands](#️-creating-new-commands)
- [🌐 Supported Languages](#-supported-languages)
- [📸 Screenshots](#-screenshots)
- [👥 Credits](#-credits)
- [📜 License & Project Rules](#-license--project-rules)

---

## ✨ Enhanced Features in This Fork

### 🤖 New Bot Behaviours

- **xtreme-fca Integration** — API layer powered by xtreme-fca, a hardened fork of the unofficial Messenger API with auto-reconnect and MQTT recovery.
- 🎵 **Music Search** — Search songs by title or artist through the Messenger music catalog and send tracks directly into chat.
- 😡 **Reaction Unsend** — React with a configured emoji to delete the bot's own message. Admin-gated by default.
- 🔁 **Reaction Mirror** — Mirror configured emoji reactions from admins onto another user's message.
- 💡 **Command Suggestions** — Typos such as `-holp` can return suggestions like "Did you mean `-help`?"
- ⚡ **NoPrefix Mode** — Run commands without a prefix when enabled, with ignore lists and optional admin-only mode.
- 🌐 **User-Agent Pool** — Multiple user agents are shipped in the configuration; a random one can be selected for each login.

### 🧩 Modernised Foundation

- Uses the xtreme-fca API layer.
- Updated dependencies and removed unused packages.
- Uses the native Canvas v3 package for image rendering.
- Hardened login flow with cookie liveness pre-check.
- Optional Google credentials support.
- `.dev.*` files are used only when `NODE_ENV=development`.
- Reliable SQLite path override through `GOAT_DB_PATH`.
- SQLite busy-timeout support to reduce lock errors on network filesystems.
- Includes `npm start`, `npm run dev` and `npm run prod`.
- Native modules are rebuilt automatically through `postinstall`.

<div align="center">

✨ ──────────── **SATURO ENGINE** ──────────── ✨

</div>

---

## 🚧 Requirements

- Node.js 22.x
- Git
- MongoDB (optional — SQLite is used otherwise)
- Basic knowledge of JavaScript / Node.js
- Basic understanding of the unofficial Messenger API

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/lazyanik/SATURO-BOT-V2.git
cd SATURO-BOT-V2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Bot

```bash
npm start
```

On first run, the bot will prompt for an account.

You can provide one of the following through `account.txt`:

- Cookie string / Netscape cookie file
- JSON app-state / cookie array
- `EAAAA…` access token
- Email + password pair through `config.json`

📘 A step-by-step installation guide is available in [`STEP_INSTALL.md`](./STEP_INSTALL.md).

---

## ⚙️ Configuration

All main settings are stored in:

```text
config.json
```

### Common Configuration Keys

| Key | Purpose |
| --- | --- |
| `prefix` | Command prefix, default `-` |
| `language` | Bot language: `en` or `vi` |
| `nickNameBot` | Bot display name |
| `adminBot` | Bot-admin user IDs |
| `dashBoard` | Dashboard enable/port/session configuration |
| `dashBoard.sessionSecret` | Persistent dashboard session secret |
| `serverUptime.socket.verifyToken` | Socket.io uptime server authentication |
| `commandSuggestion` | Command typo suggestions |
| `noPrefix` | Prefix-free command settings |
| `reactUnsend` | Delete bot messages through reactions |
| `reactMirror` | Reaction mirror settings |
| `facebookAccount.userAgents` | User-agent pool |
| `optionsFca.randomUserAgent` | Random user-agent per login |
| `optionsFca.autoReconnect` | Automatic MQTT reconnect |

> **Tip:** New configuration keys are merged with safe defaults during startup, so updating an older `config.json` should not normally break the bot.

---

## 🚀 Running the Bot

### Available Scripts

```bash
npm start
npm run dev
npm run prod
```

### Environment Variables

| Variable | Effect |
| --- | --- |
| `NODE_ENV` | Enables `.dev.*` configuration files in development mode |
| `GOAT_DB_PATH` | Overrides the SQLite database path |

When:

```json
"dashBoard": {
  "enable": true
}
```

the web dashboard is served on the configured port, `3001` by default.

Dashboard sessions are stored under:

```text
database/data/sessions/
```

The file-backed session system avoids the previous in-memory session store and automatically cleans expired sessions according to the 7-day cookie lifetime.

---

## 💡 How It Works

SATURO BOT uses the unofficial Messenger API to send and receive events.

When an event arrives, it is dispatched to the appropriate handler, which resolves commands and executes them according to permissions, cooldowns and configuration.

### Event Types

**`onStart`** — Runs when a user invokes a command.

- Detects prefix / no-prefix commands
- Checks bans
- Checks permissions
- Checks cooldowns
- Executes and logs the command

**`onChat`** — Runs on normal incoming messages.

**`onFirstChat`** — Runs when a thread is seen for the first time since startup.

**`onReaction`** — Handles reactions registered through `GoatBot.onReaction`.

```js
global.GoatBot.onReaction.set(msg.messageID, {
  messageID: msg.messageID,
  commandName
});
```

**`onReply`** — Handles replies registered through `GoatBot.onReply`.

**`onEvent`** — Handles system events such as:

- Join
- Leave
- Admin changes
- Other thread events

**`handlerEvent`** — Loads and executes event commands from:

```text
scripts/events/
```

---

## 🛠️ Creating New Commands

Commands are stored inside:

```text
scripts/cmds/
```

and loaded automatically.

### Minimal Command Example

```js
module.exports = {
  config: {
    name: "hello",
    version: "1.0",
    author: "Your Name",
    countDown: 5,
    role: 0,
    description: {
      en: "say hello"
    },
    category: "fun",
    guide: {
      en: "{pn} <name>"
    }
  },

  langs: {
    en: {
      reply: "Hello, %1!"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    return message.reply(
      getLang("reply", args[0] || "world")
    );
  }
};
```

### Permission Roles

| Role | Access |
| --- | --- |
| `0` | Everyone |
| `1` | Group administrators |
| `2` | Bot administrators |

Add localized strings under the appropriate `langs` section.

📘 Full reference: [`DOCS.md`](./DOCS.md)

---

## 🌐 Supported Languages

- [x] 🇬🇧 English — `en`
- [x] 🇻🇳 Vietnamese — `vi`

Set the language inside `config.json`.

Language files can be customized under:

```text
languages/
languages/cmds/
languages/events/
```

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2500&pause=700&color=F472B6&center=true&vCenter=true&width=650&lines=%F0%9F%9A%80+Fast+%E2%80%A2+Stable+%E2%80%A2+Powerful;%F0%9F%A4%96+Build+your+own+Messenger+bot;%E2%9C%A8+Customize+everything+your+way;%F0%9F%95%8A%EF%B8%8F+Welcome+to+SATURO+BOT+V2" alt="Animated tagline">

<br>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="divider">

### 🌟 Stay Connected

<!-- Live counters: refreshed every ~5 minutes, so new stars/forks show up automatically -->
<a href="https://github.com/lazyanik/SATURO-BOT-V2/stargazers">
  <img src="https://img.shields.io/github/stars/lazyanik/SATURO-BOT-V2?style=for-the-badge&logo=github&color=FFD166&labelColor=1b1b2f&cacheSeconds=300" alt="Stars">
</a>
<a href="https://github.com/lazyanik/SATURO-BOT-V2/forks">
  <img src="https://img.shields.io/github/forks/lazyanik/SATURO-BOT-V2?style=for-the-badge&logo=github&color=06D6A0&labelColor=1b1b2f&cacheSeconds=300" alt="Forks">
</a>
<a href="https://github.com/lazyanik/SATURO-BOT-V2/issues">
  <img src="https://img.shields.io/github/issues/lazyanik/SATURO-BOT-V2?style=for-the-badge&logo=github&color=EF476F&labelColor=1b1b2f&cacheSeconds=300" alt="Issues">
</a>
<a href="https://github.com/lazyanik/SATURO-BOT-V2/commits/main">
  <img src="https://img.shields.io/github/last-commit/lazyanik/SATURO-BOT-V2?style=for-the-badge&logo=github&color=4CC9F0&labelColor=1b1b2f&cacheSeconds=300" alt="Last commit">
</a>

<br><br>

<a href="https://github.com/lazyanik/SATURO-BOT-V2">
  <img src="https://img.shields.io/badge/⭐_Star_this_repo-if_you_like_it-FFD166?style=for-the-badge" alt="Star this repo">
</a>

<br><br>

<img src="https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif" width="60" alt="sparkles">

<br>

<img src="https://capsule-render.vercel.app/api?type=rect&height=2&color=auto" width="70%">

</div>

---

## 📸 Screenshots

### 🤖 Bot

<details>
<summary>🏆 Rank System</summary>
<p>
<img src="https://i.ibb.co/d0JDJxF/rank.png" width="399px">
<img src="https://i.ibb.co/WgZzthH/rankup.png" width="399px">
<img src="https://i.ibb.co/hLTThLW/customrankcard.png" width="399px">
</p>
</details>

<details>
<summary>🌤️ Weather</summary>
<p>
<img src="https://i.ibb.co/2FwWVLv/weather.png" width="399px">
</p>
</details>

<details>
<summary>👋 Join / Leave Notifications</summary>
<p>
<img src="https://i.ibb.co/Jsb5Jxf/wcgb.png" width="399px">
</p>
</details>

<details>
<summary>🎨 Openjourney</summary>
<p>
<img src="https://i.ibb.co/XJfwj1X/Screenshot-2023-05-09-22-43-58-630-com-facebook-orca.jpg" width="399px">
</p>
</details>

<details>
<summary>🤖 GPT</summary>
<p>
<img src="https://i.ibb.co/D4wRbM3/Screenshot-2023-05-09-22-47-48-037-com-facebook-orca.jpg" width="399px">
<img src="https://i.ibb.co/z8HqPkH/Screenshot-2023-05-09-22-47-53-737-com-facebook-orca.jpg" width="399px">
<img src="https://i.ibb.co/19mZQpR/Screenshot-2023-05-09-22-48-02-516-com-facebook-orca.jpg" width="399px">
</p>
</details>

### 🌐 Dashboard

<details>
<summary>🏠 Home</summary>
<p>
<img src="https://i.postimg.cc/GtwP4Cqm/Screenshot-2023-12-23-105357.png" width="399px">
<img src="https://i.postimg.cc/MTjbZT0L/Screenshot-2023-12-23-105554.png" width="399px">
</p>
</details>

<details>
<summary>📊 Stats</summary>
<p>
<img src="https://i.postimg.cc/QtXt98B7/image.png" width="399px">
</p>
</details>

<details>
<summary>🔐 Login / Register</summary>
<p>
<img src="https://i.postimg.cc/Jh05gKsM/Screenshot-2023-12-23-105743.png" width="399px">
<img src="https://i.postimg.cc/j5nM9K8m/Screenshot-2023-12-23-105748.png" width="399px">
</p>
</details>

<details>
<summary>🧵 Thread Management</summary>
<p>
<img src="https://i.postimg.cc/RF237v1Z/Screenshot-2023-12-23-105913.png" width="399px">
</p>
</details>

<details>
<summary>⚙️ Custom On / Off</summary>
<p>
<img src="https://i.ibb.co/McDRhmX/image.png" width="399px">
</p>
</details>

<details>
<summary>💬 Custom Welcome / Leave Messages</summary>
<p>
<img src="https://i.ibb.co/6ZrQqc1/image.png" width="399px">
<img src="https://i.ibb.co/G53JsXm/image.png" width="399px">
</p>
</details>

---

## 👥 Credits

### Original Author

**NTKhang** ([@ntkhang03](https://github.com/ntkhang03)) — Creator of [Goat-Bot-V2](https://github.com/ntkhang03/Goat-Bot-V2).

### Modified & Enhanced By

**Anik Islam Sadik** ([@lazyanik](https://github.com/lazyanik)) 🕊️

Modernised dependency stack, hardened login flow, database improvements and additional features.

### Messenger API Layer

**xtreme-fca** by [@lazyanik](https://github.com/lazyanik)

### Bot Name

**SATURO BOT V2**

---

## 📜 License & Project Rules

This project retains the MIT license information from the original project.

### Project Rules

If you use or modify this project, please keep the original author and developer credits visible.

- Do not claim the source code as your own.
- Do not remove or intentionally hide author credits.
- Do not redistribute modified copies while falsely presenting them as the official repository.
- Do not use the SATURO BOT branding to impersonate the official project.
- Respect the original project's license and attribution requirements.

> **Important:** The MIT license itself permits broad reuse, modification and redistribution. The project-specific requests above should therefore be treated as attribution/branding guidelines unless a separate legally enforceable license replaces MIT.

---

<div align="center">

<img src="https://raw.githubusercontent.com/lazyanik/SATURO-BOT-V2/main/assets/footer-hearts.svg" width="100%" alt="SATURO BOT V2 Footer">

### 🕊️✨ SATURO BOT V2 ✨🕊️

**Developed & Enhanced with ❤️ by Anik Islam Sadik**

🚀 Built with passion • ⚡ Made for performance • 💻 Crafted for developers

🌐 Repository: [lazyanik/SATURO-BOT-V2](https://github.com/lazyanik/SATURO-BOT-V2)

⭐ If you find this project useful, consider giving it a star!

💙 Thank you for using SATURO BOT V2

🔥 Keep coding • Keep creating • Keep improving 🔥

<br>

© Anik Islam Sadik — SATURO BOT V2

</div>
