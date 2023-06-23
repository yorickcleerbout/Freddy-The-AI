const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Change someone\'s nickname.')
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription('The user for who you want to change the nickname.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("nickname")
                .setDescription("The new nickname for the selected user.")
                .setRequired(true)),

    async execute(interaction) {

        // FETCH INPUT PARAMETERS
        let client = interaction.client;
        let user = interaction.options.getUser('user');
        let nickname = interaction.options.getString('nickname');

        // CONVERT USER OBJECT TO MEMBER OBJECT
        let member = interaction.guild.members.cache.get(user.id);

        // CHANGE MEMBER's NICKNAME
        await member.setNickname(nickname, `${interaction.user.username} changed the nickname using /nickname`);

        let embedDescription = client.messages.NICKNAME.EMBED.description.replace("<user>", user).replace("<nickname>", nickname);

        const embed = new EmbedBuilder()
            .setColor(client.settings.embed_color)
            .setDescription(embedDescription)

        await interaction.reply({ embeds: [embed], ephemeral: true });

    },
};