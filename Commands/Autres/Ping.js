module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });

    async function command(message) {
        const msg = await createEmbed(message.channel, '🏓 Ping...', 'success');
        let time = Math.floor(Date.now() - msg.createdAt);
        const embed = new MessageEmbed()
            .setTitle('🏓 Pong !')
            .setDescription(`Latence ${client.user.username}: ${time}ms\nLatence API: ${Math.round(client.ws.ping)}ms`)
            .setColor(colors.default)
            .setThumbnail(client.user.displayAvatarURL({
                format: 'png',
                dynamic: true,
                size: 2048
            }))
            .setTimestamp()
            .setFooter(`${client.user.username} - Ping`, client.user.displayAvatarURL({
                format: 'png',
                dynamic: true,
                size: 2048
            }));
        msg.delete();
        return message.channel.send(embed);
    };

    command.options = {
        name: ['ping', 'latence', 'latency'],
        show: 'Ping 🏓',
        description: `Cette commande vous permet de connaître la latence de ${client.user.tag} et de l'API de Discord.`,
        category: 'Information ❓',
        usage: '-ping',
        ex: '-ping',
        enabled: true,
        nsfw: false,
        reqUsrPerms: [],
        reqBotPerms: [],
        ownerOnly: false
    };

    return command;
};
