module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });

    const {
        capitalize
    } = require('lodash');
    
    async function command(message, args) {
        const definedRole = await getRole(message, args, true);
        const roleDate = capitalize(moment(definedRole.createdAt).format('ddd LL, LTS'));

        const embed = new MessageEmbed()
            .setAuthor(definedRole.name, client.user.displayAvatarURL({
                format: 'png',
                dynamic: true,
                size: 2048
            }))
            .setDescription(definedRole.toString())
            .setThumbnail(client.user.displayAvatarURL({
                format: 'png',
                dynamic: true,
                size: 2048
            }))
            .addField('Identifiant', definedRole.id, true)
            .addField('Couleur HEX', `${definedRole.hexColor.toUpperCase()}`, true)
            .addField('Création', roleDate)
            .addField('Position', definedRole.rawPosition, true)
            .addField('Mentionnable', definedRole.mentionable ? ':white_check_mark:' : ':x:', true)
            .addField('Membres ayant ce rôle', `${definedRole.members.size} - (${((definedRole.members.size / message.guild.memberCount) * 100).toFixed(0)}%)`)
            .addField('Visibilité', definedRole.hoist ? 'Affiche les membres séparément :white_check_mark:' : 'N\'affiche pas les membres séparément :x:')
            .setColor(definedRole.hexColor)
            .setTimestamp()
            .setFooter(`${client.user.username} - RoleInfo`, client.user.displayAvatarURL({
                format: 'png',
                dynamic: true,
                size: 2048
            }));
        return message.channel.send(embed);
    };

    command.options = {
        name: ['roleinfo', 'ri'],
        show: 'RoleInfo ❓',
        description: 'Cette commande vous permet d\'avoir des informations sur un rôle du serveur.',
        category: 'Information ❓',
        usage: '-roleinfo <Role>',
        ex: `-roleinfo\n-roleinfo ${client.user.username}`,
        enabled: true,
        nsfw: false,
        reqUsrPerms: [],
        reqBotPerms: [],
        ownerOnly: false
    };

    return command;
};
