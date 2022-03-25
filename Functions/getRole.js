module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });

    const {
        deburr
    } = require('lodash');

    variables.getRole = (msg, args, allowEmptySearch) => {
        return new Promise(async (resolve) => {
            if (!allowEmptySearch && !args[0]) return variables.createEmbed(msg.channel, 'Veuillez indiquer votre recherche.', 'error');

            let search;
            if (!args[0]) search = msg.member.roles.highest.id;
            else search = args.join(' ');

            if (msg.guild.roles.cache.get(search))
                resolve(msg.guild.roles.cache.get(search));
            else {
                let guildRoles = msg.guild.roles.cache.array();
                let foundRoles = [];

                for (let role of guildRoles) {
                    if (role.toString() == search || deburr(role.name).toLowerCase().includes(deburr(search).toLowerCase())) {
                        if (foundRoles.length >= 10) break;
                        else foundRoles[foundRoles.length] = role;
                    };
                };

                if (foundRoles.length == 0) variables.createEmbed(msg.channel, 'Je ne trouve pas de résultats pour `' + search + '`.', 'error');
                else if (foundRoles.length === 1) resolve(foundRoles[0]);
                else {
                    const embed = new MessageEmbed()
                        .setTitle('🔎 Recherche d\'un rôle du serveur')
                        .setDescription(`J'ai trouvé ${foundRoles.length} résultats pour votre recherche.`)
                        .addField('Voici les résultats', '```' + foundRoles.map((r, i) => {
                            return `[${i+1}] - ${r.name} (${r.id})`
                        }).join('\n') + '```')
                        .addField(`**${msg.member.displayName}**`, `Envoyez le numéro correspondant à votre recherche, si elle n'est pas dans la liste tapez \`annuler\` et recommencez en étant plus précis.`)
                        .setColor(colors.default)
                        .setThumbnail(msg.author.displayAvatarURL({
                            format: 'png',
                            dynamic: true,
                            size: 2048
                        }))
                        .setTimestamp()
                        .setFooter(`${client.user.username} - Recherche d'un rôle du serveur`, client.user.displayAvatarURL({
                            format: 'png',
                            dynamic: true,
                            size: 2048
                        }))
                    let message = await msg.channel.send(embed);

                    let collector = msg.channel.createMessageCollector(m => m.author.id == msg.author.id, {
                        time: 30000
                    });
                    collector.on('collect', ({
                        content
                    }) => {
                        collector.stop();
                        message.delete();
                        if (content.toLowerCase() === 'annuler')
                            variables.createEmbed(msg.channel, 'Annulation, effectuée !', 'error');
                        else if (isNaN(content = parseInt(content)) || content < 1 || content > foundRoles.length)
                            variables.createEmbed(msg.channel, 'Votre indication n\'est pas valide, annulation...', 'error');
                        else
                            resolve(foundRoles[content - 1]);
                    });
                };
            };
        });
    };
};