const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays information about the bot.'),
    async execute(interaction) {

        let client = interaction.client;
        // FETCHING MEMORY USAGE
        const totalram = ((os.totalmem() / 10 ** 6 + " ").split('.')[0]);
        const freeram = ((os.freemem() / 10 ** 6 + " ").split('.')[0]);
        const usedram = (((os.totalmem() - os.freemem()) / 10 ** 6 + " ").split('.')[0]);
        const prctfreeram = (((os.freemem() * 100) / os.totalmem + " ").split('.')[0]);

        let memUsage = `${client.messages.BOT_INFO.total_mem} ${totalram}MB\n${client.messages.BOT_INFO.used_mem} ${usedram}MB\n${client.messages.BOT_INFO.free_mem} ${freeram}MB\n${client.messages.BOT_INFO.percent_mem} ${prctfreeram}%`;

        // FETCHING BOT INFO
        const name = client.user.tag;
        const icon = `${client.user.displayAvatarURL()}`;

        // FETCHING UPTIME & LATENCY INFO
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        let uptime = `${days} ${client.messages.BOT_INFO.days}, ${hours} ${client.messages.BOT_INFO.hours}, ${minutes} ${client.messages.BOT_INFO.minutes} & ${seconds} ${client.messages.BOT_INFO.seconds}`;

        let ping = `${Date.now() - interaction.createdTimestamp} ms`;

        const embed = new EmbedBuilder()
            .setColor(client.settings.embed_color)
            .setTitle(client.messages.BOT_INFO.EMBED.title)
            .setDescription(client.messages.BOT_INFO.EMBED.description)
            .setAuthor({ name: name, iconURL: icon })
            .setThumbnail(icon)
            .setTimestamp()
            .addFields({ name: client.messages.BOT_INFO.EMBED.FIELDS.server_count, value: `${client.guilds.cache.size}`, inline: true })
            .addFields({ name: client.messages.BOT_INFO.EMBED.FIELDS.client_id, value: `${client.user.id}`, inline: true })
            .addFields({ name: client.messages.BOT_INFO.EMBED.FIELDS.latency, value: `${ping}`, inline: false })
            .addFields({ name: client.messages.BOT_INFO.EMBED.FIELDS.uptime, value: `\`\`\`${uptime}\`\`\``, inline: false })
            .addFields({ name: client.messages.BOT_INFO.EMBED.FIELDS.memory, value: `\`\`\`${memUsage}\`\`\``, inline: false })

        await interaction.reply({ embeds: [embed] });

    },
};