const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const { deburr } = require('lodash');

async function initFunctions(client) {
    client.baseEmbed = () => {
        return new MessageEmbed().setFooter({ text: 'NXBot • Team PoyoNX', iconURL: client.getAvatar(client.user.id) }).setTimestamp();
    };
    client.createEmbedButtons = async (interaction, embeds, authorizedUsers=false) => {
        if (!authorizedUsers)
            authorizedUsers = interaction.user.id;

        const now = Date.now().toString();
        const buttons = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId(`${now}_previous`)
            .setLabel('◀️ Page précédente')
            .setStyle('SECONDARY')
            .setDisabled(true),

            new MessageButton()
            .setCustomId(`${now}_next`)
            .setLabel('Page suivante ▶️')
            .setStyle('SECONDARY'),

            new MessageButton()
            .setCustomId(`${now}_delete`)
            .setLabel('Supprimer le message 💣')
            .setStyle('DANGER')
        );
        
        const filter = i => [`${now}_previous`, `${now}_next`, `${now}_delete`].includes(i.customId) && authorizedUsers.includes(i.user.id);
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 600000 });
        let page = 0;

        collector.on('collect', async i => {
            switch (i.customId.slice(now.length + 1)) {
                case 'previous':
                    page--;
                    break;
                case 'next':
                    page++;
                    break;
                case 'delete':
                    collector.stop('delete');
                    break;
            };

            if (!page) {
                buttons.components[0].setDisabled(true);
                buttons.components[1].setDisabled(false);
            } else if (0 < page && embeds.length - 1 > page) {
                buttons.components[0].setDisabled(false);
                buttons.components[1].setDisabled(false);
            } else {
                buttons.components[0].setDisabled(false);
                buttons.components[1].setDisabled(true);
            };

            if (i.customId.slice(now.length + 1) !== 'delete')
                await i.update({ components: [buttons], embeds: [embeds[page]] });
        });

        collector.on('end', async (_, reason) => {
            if (reason == 'delete')
                return await interaction.deleteReply();
            await interaction.editReply({ components: [], embeds: [embeds[page]] });
        });
        
        return await interaction.editReply({ components: [buttons], embeds: [embeds[0]] });
    };
    client.createEmbed = (interaction, message, { type='default', emote='', color='' }) => {
        return new MessageEmbed().setColor(type == 'memberColor' ? interaction.memberColor : client.colors[type] || color).setDescription(`${client.emotes[type] || client.emotes[emote] || ''} ${message}`);
    };
    client.createDiscordTimestamp = (timestamp, flag='R') => {
        return `<t:${timestamp}:${flag}>`;
    };
    client.createSelection = async (interaction, list, authorizedUsers=false) => {
        if (!authorizedUsers)
            authorizedUsers = interaction.user.id;

        const now = Date.now().toString();
        const selection = new MessageActionRow()
        .addComponents(new MessageSelectMenu()
        .setCustomId(`${now}_selection`)
        .addOptions([{ label: 'Annuler', description: '❌ Permet d\'annuler ', value: 'cancel' }, ...list]))
        
        await interaction.editReply({ embeds: [client.createEmbed(interaction, `⚠️ Veuillez faire votre choix dans la liste ci-dessous \`(${list.length} résultats)\`, vous pouvez annuler en choisissant l'option d'annulation *ou en attendant 15 secondes*`, { type: 'memberColor' })], components: [selection] });
        const filter = i => i.customId === `${now}_selection` && authorizedUsers.includes(i.user.id);
        return await interaction.channel.awaitMessageComponent({ filter, time: 15000 }).then(async r => { 
            await r.update({ components: [] });
            if (r.values[0] == 'cancel')
                await interaction.editReply({ embeds: [client.createEmbed(interaction, 'Vous avez décidé **d\'annuler**, la commande __s\'arrête__ donc ici', { type: 'success' })] });
            return r.values[0];
         }).catch(async () => { await interaction.editReply({ components: [], embeds: [client.createEmbed(interaction, 'Vous n\'avez **rien** sélectionné, la commande __s\'arrête__ donc ici', { type: 'warning' })] }); return 'cancel';  });
    };
    client.checkOwner = (userid) => {
        return client.owners.includes(userid);
    };
    client.compareText = (originalText, comparedText) => {
        return deburr(originalText.toLowerCase()).replace(/[^a-z0-9]/g, '').includes(deburr(comparedText.toLowerCase()).replace(/[^a-z0-9]/g, ''));
    };
    client.checkPermissions = (member, permissions) => {
        return [member.permissions.has(permissions), permissions.filter(permission => !member.permissions.has(permission))];
    };
    client.permissionsError = async (interaction, member, permissions) => {
        const Embed = client.baseEmbed()
        .setColor(client.colors.error)
        .setDescription('❌ Cette commande ne peut pas être utilisée')
        .addField('Raison', `Permissions manquantes pour ${member}:\n\`\`\`${permissions.map(permission => `• ${permission}`).join('\n')}\`\`\``)
        
        return await interaction.reply({ embeds: [Embed] });    
    };
    client.getAvatar = (userid) => client.users.cache.get(userid)?.displayAvatarURL({ format: 'png', dynamic: true, size: 512 }) || '';
    client.reportError = async (interaction, command, error) => {
        const Embed = client.baseEmbed()
        .setColor(client.colors.error)
        .setDescription(`❌ Une erreur est survenue lors de l\'exécution de la commande \`${command}\`, un message a été envoyé au serveur de support`)

        await interaction.editReply({ components: [], embeds: [Embed] });
    
        const ErrorEmbed = client.baseEmbed()
        .setColor(client.colors.error)
        .setTitle(`❌ Une erreur est survenue lors de l\'exécution de la commande \`${command}\``)
        .setDescription(`\`\`\`js\n${error}\`\`\``)
        
        return await client.supportServer.errorChannel.send({ embeds: [ErrorEmbed] });
    };
};

module.exports = initFunctions;
