const { Events, EmbedBuilder } = require('discord.js');
const chalk = require("chalk");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(chalk.bold.yellow(`No command matching ${interaction.commandName} was found.`));
            return;
        }

        try {
            await command.execute(interaction);

            let logMsg = `[LOGGING] - id: ${chalk.italic(interaction.user.id)} - tag: ${chalk.italic(interaction.user.username)} - cmd: ${chalk.italic(interaction.commandName)} - status: ${chalk.italic('success')}`;
            console.log(chalk.magenta(logMsg));

        } catch (error) {
            console.error(chalk.bold.red(`Error executing ${interaction.commandName}`));
            console.error(chalk.bold.red(error));

            let errorMsg = error.toString().split(':');

            let logMsg = `[LOGGING] - id: ${chalk.italic(interaction.user.id)} - tag: ${chalk.italic(interaction.user.username)} - cmd: ${chalk.italic(interaction.commandName)} - status: ${chalk.italic('failed')} - Error: ${chalk.italic(errorMsg[1])}`;
            console.log(chalk.magenta(logMsg));

            const embed = new EmbedBuilder()
                .setColor(interaction.client.settings.embed_color)
                .addFields({ name: errorMsg[0], value: `\`\`\`${errorMsg[1]}\`\`\``, inline: false })

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
    },
};