const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
var AsciiTable = require('ascii-table');
require('dotenv').config()


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


const settings = require("./config/settings.json");
const messages = require("./config/messages.json");

client.settings = settings;
client.messages = messages;
client.commands = new Collection();


// LOADING COMMANDS
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);


let loaded = [];

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {

            const properties = { folder, ...command };
            client.commands.set(command.data.name, properties);
            commands.push(command.data.toJSON());
            loaded.push({ cat: filePath.split('\\').slice(-2, -1), cmd: command.data.name, status: true })
        } else {
            loaded.push({ cat: filePath.split('\\').slice(-2, -1), cmd: filePath.split('\\').pop().replace('.js', ''), status: false })
            console.log(chalk.bold.yellow(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`));
        }
    }
}


// LOADING EVENTS
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// REGISTERING COMMANDS TO DISCORD
const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
    try {

        console.log(chalk.bold.blue(`Started refreshing ${commands.length} application (/) commands.`));

        const data = await rest.put(
            Routes.applicationCommands(process.env.BOT_ID),
            { body: commands },
        );

        console.log(chalk.bold.blue(`Successfully reloaded ${data.length} application (/) commands.`));

    } catch (error) {
        console.error(error);
    }
})();


// LOGIN THE BOT
client.login(process.env.BOT_TOKEN);


// PRINT TABLE WITH LOADED AND FAILED COMMANDS
var table = new AsciiTable('Commands')
table.setHeading('Category', 'Command', 'Status')

loaded.forEach(obj => {
    if (obj.status) table.addRow(obj.cat, obj.cmd, chalk.bold.green('Loading Success'))
    else table.addRow(obj.cat, obj.cmd, chalk.bold.red('Loading Failed'))
});

console.log(table.toString())