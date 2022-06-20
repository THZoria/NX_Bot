const getFiles = require('../system/getFiles');

async function registerCommands(client) {
    const commandFiles = getFiles('./commands');
    for (const commandFile of commandFiles) {
        const command = require(commandFile);
        console.log(`✅ Commande ${command.name} chargée !`);
        client.commands.push(command);
    };
};

async function registerEvents(client) {
    const eventFiles = getFiles('./events');
    for (const eventFile of eventFiles) {
        const event = require(eventFile);
        console.log(`✅ Event ${event.name} chargé !`);
        if (event.once)
            client.once(event.name, async (...args) => { await event.run(client, ...args); });
        else 
            client.on(event.name, async (...args) => { await event.run(client, ...args); });
    };
};

module.exports = { registerCommands, registerEvents };