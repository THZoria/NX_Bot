module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });

    async function event(message) {
        if (message.author.bot || (message.guild && !message.channel.permissionsFor(message.guild.me).missing('SEND_MESSAGES'))) return;

        const prefix = '-';
        const args = message.content.slice(prefix.length).trim().split(/ +/g).slice(1);
        if (!message.content.startsWith(prefix) || (message.guild && !message.member)) return;

        if (message.guild) {
            if (message.content.toLowerCase().startsWith(prefix + 'help ') || message.content.toLowerCase().startsWith(prefix + 'h ') || message.content.startsWith(prefix + 'aide ')) {
                let command = require('../Components/Help')(variables);
                return command(message, args);
            };
        };

        let commands = getFiles(__dirname + '/../Commands').filter(f => f.endsWith('.js'));
        for (let i = 0; i < commands.length; i++) {
            let command = require(commands[i])(variables);
            for (let n = 0; n < command.options.name.length; n++) {
                if (message.content.toLowerCase().startsWith(prefix + command.options.name[n].toLowerCase())) {
                    if (!command.options.enabled)
                        return createEmbed(message.channel, `La commande \`\`${command.options.name[0]}\`\` a été désactivée pour le moment.`, 'error');
                    if (command.options.guildOnly && !message.guild)
                        return createEmbed(message.channel, `La commande \`\`${command.options.name[0]}\`\` est utilisable que sur un serveur.`, 'error');
                    if (command.options.nsfw && !message.channel.nsfw)
                        return createEmbed(message.channel, `La commande \`\`${command.options.name[0]}\`\` est utilisable que sur un salon NSFW.`, 'error');
                    if (command.options.ownerOnly && !checkOwner(message.author.id))
                        return createEmbed(message.channel, `La commande \`\`${command.options.name[0]}\`\` est utilisable que par ${getOwner().map(owner => owner.tag).join(', ')}.`, 'error');

                    const {
                        reqUsrPerms,
                        reqBotPerms
                    } = command.options;

                    if (message.guild) {
                        if (!message.guild.me.hasPermission(reqBotPerms)) {
                            return createPermsEmbed(command.options, client.user.tag, message.channel, reqBotPerms);
                        }
                        if (!message.member.hasPermission(reqUsrPerms)) {
                            return createPermsEmbed(command.options, message.author.tag, message.channel, reqUsrPerms);
                        };
                    } else {
                        return createEmbed(message.channel, 'Vous ne pouvez pas utiliser les commandes en dehors d\'un serveur.', 'error');
                    };
                    return command(message, args);
                };
            };
        };
    };

    event.listener = 'message';

    return event;
};
