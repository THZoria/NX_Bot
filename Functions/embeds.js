module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });

    variables.createEmbed = (channel, message, type) => {
        const embed = new MessageEmbed()
            .setColor(colors[type])
            .setDescription(`**${message}**`);
        return channel.send(embed);
    };

    variables.createPermsEmbed = (cmd, usertag, channel, perms) => {
        for (let i in perms) perms[i] = permissionsList[perms[i]];

        const embed = new MessageEmbed()
            .setTitle('❗ Permissions manquantes')
            .setThumbnail(client.user.displayAvatarURL({
                format: 'png',
                dynamic: true,
                size: 2048
            }))
            .addField('Commande', cmd.show)
            .addField('Catégorie', cmd.category)
            .addField('Utilisateur avec les permissions manquantes', usertag)
            .addField('Permissions nécessaires pour l\'exécution de la commande', perms.join(', '))
            .addField('Comment régler le problème ?', `Pour régler les problèmes de permissions, il suffit d'ajouter les permissions spécifiées au-dessus à **${usertag}**.`)
            .setColor(colors.error)
            .setTimestamp()
            .setFooter(`${client.user.username} ${version} créé par ${getOwner()[0].tag}`, client.user.displayAvatarURL({
                format: 'png',
                dynamic: true,
                size: 2048
            }));
        return channel.send(embed);
    };
};