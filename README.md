<!-- markdownlint-disable first-line-h1 -->
<!-- markdownlint-disable html -->
<!-- markdownlint-disable no-duplicate-header -->

<div align="center">
  <img src="logo.png" width="60%" alt="KitaBOT" />
</div>
<hr>

# KitaBOT - Addon-based Discord Bot template.


KitaBOT is a fully **modular**, **addon-based**, **ES module**-powered Discord.js bot template. Commands, events, and dependencies are isolated within each addon, making it easy to expand the project with new features.

## 📦 Features

- 🧩 Modular architecture with addon support
- 🧠 Built-in slash command and event handling
- 📁 Automatic dependency management via `modules.yml`
- 💬 YAML-based configuration (`config.yml`)
- ⚙️ Full ES module (ESM) compatibility

---

## 🚀 Installation

```bash
git clone https://github.com/Kitamor/kitabot.git
cd kitabot
npm install
```

### Example `config.yml`

```yaml
token: "DISCORD_BOT_TOKEN"
```

---

## ▶️ Running the Bot

```bash
node index.js
```

On first launch, the bot will:
- Scan all addons
- Load all commands
- Register events
- Automatically install missing dependencies listed in `modules.yml`

---

## ➕ How to Create an Addon

An addon can contain its own commands, events, and dependencies. The structure should be as follows:

```
addons/
└── example/
    ├── commands/
    │   └── ping.js
    └── events/
        └── ready.js
```

### 🔹 `example/commands/ping.js`

```js
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong.'),
    run: async (client, interaction) => {
        await interaction.reply(`🏓 Pong! ${client.ws.ping} ms`);
    }
};
```

### 🔹 `example/events/ready.js`

```js
import { ActivityType } from 'discord.js';

export default {
    name: 'ready',
    once: true,
    execute(client) {
        client.user.setActivity({ name: `${client.user.username}`, type: ActivityType.Custom });
    }
};
```

---

## 📂 How the Addon System Works

1. Each folder inside the `addons/` directory is treated as an addon.
2. `.js` files in `commands/` are loaded as slash commands.
3. `.js` files in `events/` are automatically registered as Discord event listeners.

---

## 📝 License

<a href="LICENSE">This software is under the MIT License. Click to read what you can do.</a>