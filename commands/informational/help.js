const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Sends the help menu.'),

    async execute(interaction) {

        let client = interaction.client;

        // CREATE FUNCTION TO GET COMMAND ID TO USE AS CLICKABLE COMMAND IN EMBED
        function getCommand(name, commands) {
            let commandID = commands.filter((cmd) => cmd.name === name).map((cmd) => cmd.id);
            return commandID;
        }

        // MAPPING COMMANDS TO THEIR CATEGORY FOLDER
        let directories = [...new Set(client.commands.map((cmd) => cmd.folder)),];

        // CREATE FUNCTION TO CAPITALIZE THE FIRST LETTER OF A WORD
        let formatString = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

        // CREATING CATEGORIES AND MAP THERE COMMAND NAME AND DESCRIPTION TO IT
        let categories = directories.map((dir) => {
            let getCommands = client.commands.filter((cmd) => cmd.folder === dir).map((cmd) => {
                return {
                    name: cmd.data.name,
                    description: cmd.data.description || client.messages.HELP.EMBED.no_description
                };
            });

            return {
                directory: formatString(dir),
                commands: getCommands
            };
        });

        // CREATE HELP MENU EMBED
        let embed = new EmbedBuilder()
            .setColor(client.settings.embed_color)
            .setTitle(client.messages.HELP.EMBED.title)
            .setDescription(client.messages.HELP.EMBED.description)

        // CREATE STATEFULL DROPDOWN MENU COMPONENT
        let menu = (state) => [
            new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("help-menu")
                        .setPlaceholder(client.messages.HELP.EMBED.MENU.placeholder)
                        .setDisabled(state)
                        .addOptions(
                            categories.map((cmd) => {
                                return {
                                    label: cmd.directory,
                                    value: cmd.directory.toLowerCase(),
                                    description: client.messages.HELP.EMBED.MENU.description.replace("<category>", cmd.directory),
                                    emoji: client.settings.HELP_MENU_EMOJIS[cmd.directory.toLowerCase() || null]
                                };
                            })
                        )
                ),
        ];

        // SEND HELP EMBED WITH DROPDOWN MENU
        let helpMessage = await interaction.reply({ embeds: [embed], components: menu(false) });

        // CREATE FILTER FUNCTION TO CHECK IF INTERACTION USER IS THE SAME USER THAT USES THE DROPDOWN
        let filter = (interaction) => interaction.user.id === interaction.member.id;

        // CREATE A COLLECTOR TO HANDLE THE CHANGE OF THE DROPDOWN MENU
        let collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.StringSelect
        });

        // FETCH ALL COMMANDS HERE TO IGNORE PROMISE IN LATER STAGE
        let allCommands = await client.application.commands.fetch();

        // HANDLE THE CHANGE OF MENU ITEM
        collector.on("collect", (interaction) => {

            let [directory] = interaction.values;
            let category = categories.find((x) => x.directory.toLowerCase() === directory);

            // CREATE EMBED OBJECT FOR CATEGORY MESSAGE
            let categoryEmbed = new EmbedBuilder()
                .setColor(client.settings.embed_color)
                .setTitle(`${formatString(directory)} Commands`)
                .setDescription(client.messages.HELP.EMBED.category_description.replace("<category>", directory))
                .addFields(
                    category.commands.map((cmd) => {
                        return {
                            name: `</${cmd.name}:${getCommand(cmd.name, allCommands)}>`,
                            value: `\`${cmd.description}\``,
                            inline: true
                        }
                    })
                );

            // EDIT ORIGINAL EMBED WITH NEW CATEGORY
            interaction.update({ embeds: [categoryEmbed] });
        });

        // HANDLE COLLECTOR END, SET STATE OF MENU TO TRUE
        collector.on("end", () => {
            helpMessage.edit({ components: menu(true) });
        });

    },
};