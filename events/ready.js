const { Events, ActivityType } = require('discord.js');
const chalk = require("chalk");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(chalk.bold.green(`Ready! Logged in as ${client.user.tag}`));

        client.user.setPresence({
            activities: [{ name: `A.I take over the world.`, type: ActivityType.Watching }],
            status: 'idle',
        });
    },

};