module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });
    

    const { platform } = require('os');
    const { capitalize } = require('lodash');

    async function command(message) {
        const { uptime } = await client;
        const { username, id } = await client.user;
        const ownerInfo = await getOwner();

        let msConvert = (ms) => {
            var seconds = ms / 1000;
            var hours = parseInt(seconds / 3600);
            seconds = seconds % 3600;
            var minutes = parseInt(seconds / 60);
            seconds = parseInt(seconds % 60);
            return `${hours}h ${minutes}min ${seconds}s`
        };

        const botuptime = msConvert(uptime);

        const embed = new MessageEmbed()
        .setAuthor(`${client.user.username}`, client.user.displayAvatarURL({
            format: 'png',
            dynamic: true,
            size: 2048
        }))
        .setThumbnail(ownerInfo[0].displayAvatarURL({
            format: 'png',
            dynamic: true,
            size: 2048
        }))
        .addField('Nom', username, true)
        .addField('Identifiant', id, true)
        .addField('Librairie', `Discord.js (${require('../../package.json').dependencies['discord.js'].replace('^', '')})`, true)
        .addField('Serveurs', client.guilds.cache.size, true)
        .addField('Créateurs', ownerInfo.map(owner => `${owner.tag} (${owner.id})`).join('\n'))
        .addField(`Ajouter ${client.user.username}`, `[Ajouter ${client.user.username} (Administrateur)](https://discord.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=8)\n[Ajouter ${client.user.username} (Permissions modifiables)](https://discord.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=2146958847)`)
        .addField('Système d\'exploitation', capitalize(platform()))
        .addField('Uptime', botuptime)
        .setColor(colors.default)
        .setTimestamp()
        .setFooter(`${client.user.username} - Bot Info`, client.user.displayAvatarURL({
            format: 'png',
            dynamic: true,
            size: 2048
        }));

        return message.channel.send(embed);
    };

    command.options = {
        name: ['botinfo', 'nxbot'],
        show: 'Bot Info ❓',
        description: `Cette commande vous permet d'avoir des informations sur ${client.user.tag}.`,
        category: 'Information ❓',
        usage: '-botinfo',
        ex: '-botinfo',
        enabled: true,
        nsfw: false,
        reqUsrPerms: [],
        reqBotPerms: [],
        ownerOnly: false
    };

    return command;
};
