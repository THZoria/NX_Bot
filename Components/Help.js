module.exports = (variables) => {
    Object.keys(variables).map(variable => {
      global[variable] = variables[variable];
    });

    const { deburr } = require('lodash');

    async function command(message, args){

        let commandFiles = getFiles(`${__dirname}/../Commands`).filter(c => c.endsWith('.js'));
        let commands = [];
        let search = args.join('').toLowerCase();

        for (let i = 0; i < commandFiles.length; i++) {
            let command = require(commandFiles[i])(variables);
            commands.push(command.options);
        };

        let CategoryArray = {};
        const Categories = [];
        const Commands = [];

        for (let i = 0; i < commands.length; i++) {
            const { name, category, reqUsrPerms, reqBotPerms, ownerOnly, enabled } = commands[i];

            if (name[0] === 'warez' && message.guild.id !== '776485335831019551' || name[0] === 'ticket' && message.guild.id !== '454099185416011776') continue;

            if (!CategoryArray[category]) {
                CategoryArray[category] = [];
                    Categories.push(category);
                };

            if (message.member.hasPermission(reqUsrPerms) && message.guild.me.hasPermission(reqBotPerms) && enabled) {
                if (ownerOnly && checkOwner(message.author.id)) {
                        CategoryArray[category].push(name[0]);
                        Commands.push(commands[i]);
                } else if (!ownerOnly) {
                        CategoryArray[category].push(name[0]);
                        Commands.push(commands[i]);
                };
            };
        };

        for (let i = 0; i < Object.keys(CategoryArray).length; i++) {
            if (CategoryArray[Categories[i]].length === 0) {
                delete CategoryArray[Categories[i]];
                delete Categories[i];
            };
        };

        if (!search) {
            const embed = new MessageEmbed()
            .setAuthor(`${client.user.username}`, client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
            .setDescription(`Commande Help, vous retrouverez ici toutes les commandes disponibles. Elles sont classées par catégories pour améliorer la lisibilité et la facilité à trouver la commande souhaitée !\n\nLe préfixe de ${client.user.username} est \`-\`\nVous pouvez également faire \`-help [Nom de la commande]\` pour avoir des informations sur une commande spécifique.\nLes \`[]\` et les \`<>\` ne sont pas à inclure lors de l'exécution d'une commande.`)
            for (let i = 0; i < Object.keys(CategoryArray).length; i++) {
                embed.addField(Categories[i], CategoryArray[Categories[i]].join(' | '))
            };
            embed.setThumbnail(client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
            .setColor(colors.default)
            .setTimestamp()
            .setFooter(`${client.user.username} - Help`, client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
            return message.channel.send(embed);
        } else {
            let foundCommands = []; 
        
            for (let i = 0; i < Commands.length; i++) {
                if (deburr(Commands[i].name.join('')).toLowerCase().includes(deburr(search.toLowerCase())) || deburr(Commands[i].category).toLowerCase().includes(deburr(search.toLowerCase()))) {
                    if (foundCommands.length === 10) {
                        break;
                    } else {
                        foundCommands[foundCommands.length] = Commands[i];
                    };
                };
            };

            const getInfo = (command) => {
                const embed = new MessageEmbed()
                .setAuthor(`${command.show}`, client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
                .setDescription('Les \`[]\` et les \`<>\` ne sont pas à inclure lors de l\'exécution d\'une commande.\`\`\`[] : Obligatoire\n<> : Facultatif\`\`\`')
                .addField('Description', `> ${command.description}`)
                .addField('Catégorie', command.category)
                .addField('Utilisable', command.enabled ? '✅' : '❌', true)
                .addField('Utilisation', command.usage, true)
                .addField('Exemple', command.ex, true)
                .addField('NSFW', command.nsfw ? '✅' : '❌', true)
                .setThumbnail(client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
                .setColor(colors.default)
                .setTimestamp()
                .setFooter(`${client.user.username} - ${command.show}`, client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }));
                if (command.name.length > 1) {
                    embed.addField(`Aliases (${command.name.length - 1})`, command.name.slice(1).join(' | '));
                };
                return message.channel.send(embed);
            };
    
            if (foundCommands.length === 0) {
                return client.createEmbed(message.channel, `Je ne trouve pas de résultats pour \`${search}\`.`, 'error');
            } else if (foundCommands.length === 1) {
                getInfo(foundCommands[0]);
            } else {
                const embed = new MessageEmbed()
                .setTitle(`🔎 Recherche d\'une commande de ${client.user.username}`)
                .setDescription(`J'ai trouvé ${foundCommands.length} résultats pour votre recherche.`)
                .addField('Voici les résultats', `\`\`\`${foundCommands.map((c, i) => { return `[${i+1}] - ${c.name[0]} (${c.category})` }).join('\n')}\`\`\``)
                .addField(`**${message.member.displayName}**`, `Envoyez le numéro correspondant à votre recherche, si elle n'est pas dans la liste tapez \`annuler\` et recommencez en étant plus précis.`)
                .setColor(colors.default)
                .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
                .setTimestamp()
                .setFooter(`${client.user.username} - Recherche d\'une commande`, client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
                let msg = await message.channel.send(embed);
                
                const filter = m => m.author.id === message.author.id;
                const collector = message.channel.createMessageCollector(filter, { time: 30000 });
                collector.on('collect', ({ content }) => {
                    if (content.toLowerCase() === 'annuler') {
                        collector.stop();
                        msg.delete();
                        return createEmbed(message.channel, 'Annulation effectuée !', 'error');
                    };
                    if (isNaN(content) || content < 1 || content > foundCommands.length) {
                        collector.stop();
                        msg.delete();
                        return createEmbed(message.channel, 'Votre indication n\'est pas valide, annulation...', 'error');
                    };
                    msg.delete();
                    collector.stop();
                    getInfo(foundCommands[content - 1]);
                });
            };
        };
    };

    return command;
};
