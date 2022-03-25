require('dotenv').config();
module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });
    
    variables.getReleases = async (link, color, system, rsName, msg, type) => {
        try {
            let { channel } = msg;
            let release = await fetch(`https://api.github.com/repos/${link}/releases`, {
                headers : {
                    'Authorization' : `token ${process.env.SECRET_GITHUB}`
                }
            });
            release = await release.json();
            release = release[0];
            try {
                if (release.assets.length === 0) {
                    return client.createEmbed(msg.channel, 'Aucun fichier trouvé sur cette release.', 'error');
                };
            } catch (e) {
                return createEmbed(msg.channel, 'Aucune release trouvée avec cette recherche.', 'error');
            };
            var links = release.assets.map(d => { return `[${d.name}](${d.browser_download_url}) \`${prettysize(d.size)}\`` }).join('\n');
            var ext = release.assets.map(d => d.name);
            var size = release.assets.map(d => prettysize(d.size));
            var URL = release.assets.map(d => { return `${d.browser_download_url}\n` });

            if (type) {
                let linksObj = {};
                let nameObj = {};
                let sizeObj = {};

                let n = 1;
                let found = '';

                for (let i = 0; i < ext.length; i++) {
                    if (ext[i].endsWith('.cia')) {
                        found = found + `[${n}] - ${ext[i]}\n`;
                        linksObj[n] = URL[i];
                        nameObj[n] = ext[i];
                        sizeObj[n] = size[i];
                        n++;
                    } else {
                        continue;
                    };
                };

                if (found === '') {
                    return client.createEmbed(msg.channel, 'Je ne trouve pas de fichiers compatibles pour avoir un QRCode.', 'error');
                };

                if (n === 2) {
                    let attachment = new MessageAttachment(`http://chart.apis.google.com/chart?cht=qr&chs=524x524&chl=${linksObj[1]}`, 'QR.png');
                    const QREmbed = new MessageEmbed()
                        .setAuthor(nameObj[1], release.author.avatar_url)
                        .setDescription(`\`\`\`Nom : ${nameObj[1].replace('.cia', '')}\nAuteur : ${release.author.login}\nTaille : ${sizeObj[1]}\`\`\``)
                        .addField('**Comment installer un fichier ``.cia`` via un QRCode sur FBI ?**', `\`\`\`- Allumez votre Nintendo 3DS\n- Lancez FBI\n- Appuyez sur 'Remote Install'\n- Appuyez sur 'Scan QR Code'\n- Scannez le QRCode ci-dessous\n- Appuyez sur A\n\n'${nameObj[1]}' s'installe sur votre console ^^\`\`\``)
                        .attachFiles(attachment)
                        .setImage('attachment://QR.png')
                        .setColor(color)
                        .setTimestamp()
                        .setFooter(`${client.user.username} - ${rsName} (QRCode) [Résultat unique]`, client.user.displayAvatarURL({
                            format: 'png',
                            dynamic: true,
                            size: 2048
                        }));
                    return channel.send(QREmbed);
                };

                let getEmbed = new MessageEmbed()
                    .setTitle('🔎 Recherche de fichier')
                    .setDescription(`J'ai trouvé ${n - 1} résultats pour votre recherche.`)
                    .addField('Voici les résultats', `\`\`\`${found}\`\`\``)
                    .addField(`**${msg.member.displayName}**`, `Envoyez le numéro correspondant à votre recherche, si elle n'est pas dans la liste tapez \`\`annuler\`\`.`)
                    .setColor(color)
                    .setThumbnail(msg.author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
                    .setTimestamp()
                    .setFooter(`${client.user.username} - Recherche de fichier`, client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }))
                channel.send(getEmbed).then(MSG => {
                    const filter = m => m.author.id === msg.author.id;
                    const collector = channel.createMessageCollector(filter, { time: 30000 });
                    let i;
                    collector.on('collect', m => {
                        i = m.content;

                        if (i.toLowerCase() === 'annuler') {
                            collector.stop();
                            MSG.delete();
                            return channel.createEmbed(msg.channel, 'Annulation effectuée !', 'success')
                        };
                        if (isNaN(i) || i < 1 || i > n - 1) {
                            collector.stop();
                            MSG.delete();
                            return client.createEmbed(msg.channel, 'Votre indication n\'est pas valide.', 'error');
                        };
                        MSG.delete();
                        collector.stop();
                        let attachment = new MessageAttachment(`http://chart.apis.google.com/chart?cht=qr&chs=524x524&chl=${linksObj[i]}`, 'QR.png');

                        const QREmbed = new MessageEmbed()
                            .setAuthor(nameObj[i], release.author.avatar_url)
                            .setDescription(`\`\`\`Nom : ${nameObj[i].replace('.cia', '')}\nAuteur : ${release.author.login}\nTaille : ${sizeObj[i]}\`\`\``)
                            .addField('**Comment installer un fichier ``.cia`` via un QRCode sur FBI ?**', `\`\`\`- Allumez votre Nintendo 3DS\n- Lancez FBI\n- Appuyez sur 'Remote Install'\n- Appuyez sur 'Scan QR Code'\n- Scannez le QRCode ci-dessous\n- Appuyez sur A\n\n'${nameObj[i]}' s'installe sur votre console ^^\`\`\``)
                            .attachFiles(attachment)
                            .setImage('attachment://QR.png')
                            .setColor(color)
                            .setTimestamp()
                            .setFooter(`${client.user.username} - ${rsName} (QRCode)`, client.user.displayAvatarURL({
                                format: 'png',
                                dynamic: true,
                                size: 2048
                            }));
                        return channel.send(QREmbed);
                    })
                });
            } else {
                const Release = new MessageEmbed()
                    .setTitle(`Releases (${system}) : **${rsName}**`)
                    .setDescription(links)
                    .addField('**Auteur**', `[${release.author.login}](${release.author.html_url})`)
                    .setThumbnail(release.author.avatar_url)
                    .setColor(color)
                    .setTimestamp()
                    .setFooter(`${client.user.username} - ${rsName}`, client.user.displayAvatarURL({
                        format: 'png',
                        dynamic: true,
                        size: 2048
                }));
                return channel.send(Release);
            };
        } catch (e) {
            console.log(e);
            return createEmbed(msg.channel, 'Une erreur est survenue lors de l\'exécution de la commande.', 'error');
        };
    };
};