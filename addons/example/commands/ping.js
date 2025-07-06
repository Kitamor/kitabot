import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong.'),
    run: async (client, interaction) => {
        await interaction.reply(`🏓 Pong! ${client.ws.ping} ms`);
    }
};
