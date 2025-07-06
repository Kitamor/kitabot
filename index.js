import { Client, Collection, GatewayIntentBits, Partials, InteractionType } from 'discord.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import moment from 'moment';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { pathToFileURL, fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = (content) => {
    console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${content}`);
};

const fileContents = readFileSync('./config.yml', 'utf8');
const config = yaml.load(fileContents);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent
    ],
    shards: 'auto',
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember
    ]
});

client.commands = new Collection();
const rest = new REST({ version: '10' }).setToken(config.token);
const commands = [];
const commandsList = [];

const addonsPath = path.join(__dirname, 'addons');
const addonFolders = readdirSync(addonsPath).filter(name =>
    statSync(path.join(addonsPath, name)).isDirectory()
);

async function loadHandlers() {
    for (const addon of addonFolders) {
        const commandPath = path.join(addonsPath, addon, 'commands');
        if (statSync(commandPath, { throwIfNoEntry: false })?.isDirectory()) {
            const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const fileUrl = pathToFileURL(path.join(commandPath, file)).href;
                const commandModule = await import(fileUrl);
                const command = commandModule.default || commandModule;

                if (!command?.data?.toJSON || !command?.run) {
                    log(`(${addon}) | Skipped invalid command ${file}`);
                    continue;
                }

                commandsList.push({
                    name: command.data.name,
                    file: pathToFileURL(path.join(commandPath, file)).href
                });


                commands.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
                log(`(${addon}) | Loaded command ${file}`);
            }
        }

        const eventPath = path.join(addonsPath, addon, 'events');
        if (statSync(eventPath, { throwIfNoEntry: false })?.isDirectory()) {
            const eventFiles = readdirSync(eventPath).filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                const fileUrl = pathToFileURL(path.join(eventPath, file)).href;
                const eventModule = await import(fileUrl);
                const event = eventModule.default || eventModule;

                if (!event?.name || typeof event.execute !== 'function') {
                    log(`(${addon}) | Skipped invalid event ${file}`);
                    continue;
                }

                if (event.once) {
                    client.once(event.name, (...args) => event.execute(client, ...args));
                } else {
                    client.on(event.name, (...args) => event.execute(client, ...args));
                }

                log(`(${addon}) | Loaded event ${file}`);
            }
        }
    }
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand() && interaction.type == InteractionType.ApplicationCommand && !interaction.user.bot) {
        const match = commandsList.find(cmd =>
            interaction.commandName.toLowerCase() === cmd.name.toLowerCase()
        );

        if (match) {
            try {
                const cmdModule = await import(match.file);
                const command = cmdModule.default || cmdModule;
                await command.run(client, interaction);
            } catch (error) {
                console.error(`Komut çalıştırma hatası (${match.name}):`, error);
                await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu.', ephemeral: true });
            }
        }
    }
});


client.once('ready', async () => {
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
    } catch (error) {
        console.error('Command registration failed:', error);
    }

    log(`${client.user.username} is online.`);
});

async function main() {
    await loadHandlers();
    await client.login(config.token).catch(err => {
        console.error('Failed to login:', err);
        process.exit(1);
    });
    log(`Loaded ${addonFolders.length} addon(s).`);
}

main();
