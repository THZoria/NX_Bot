require('dotenv').config();

async function initVariables(client) {
    client.version = require('../../package.json').version;
    client.commands = [];
    client.isDown = false;
    client.owners = process.env.CLIENT_OWNERS.split(';');
    client.colors = {
        default: 0xFF0000,
        success: 0x076A00,
        warning: 0xFF7400,
        error: 0xBC0101,
        unknown: 0x686868
    };
    client.emotes = {
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
};

module.exports = initVariables;