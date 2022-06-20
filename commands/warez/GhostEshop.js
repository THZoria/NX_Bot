const CommandStructure = require('../../utils/structures/CommandStructure');
const fetch = require('node-fetch');

const GhostEshop = new CommandStructure({
    name: 'ghosteshop',
    description: '👻 Affiche des informations sur une application du Ghost eShop',
    category: '💀 Warez',
    run: async (client, interaction) => {
        const game = interaction.options.getString('game');
        
        const api = await fetch('https://cdn.ghosteshop.com/script/ghosteshop.json').catch(async e => {
            await interaction.editReply({ embeds: [client.createEmbed(interaction, '**Une erreur est survenue** lors de l\'accès à l\'API', { type: 'warning' })] });
            return false;
        });

        if (!api) return;
        const { ok, status, statusText } = api;

        if (!ok)
            return await interaction.editReply({ embeds: [client.createEmbed(interaction, `**Une erreur est survenue** \`Code: ${status} - ${statusText}\``, { type: 'warning' })] });

        const GhostEshop = (await api.json()).storeContent;
        const foundGames = GhostEshop.filter(({ info }) => client.compareText(info.title, game));
        let selectedGame;

        if (!foundGames.length)
            return await interaction.editReply({ embeds: [client.createEmbed(interaction, 'Aucun jeu n\'a été trouvé avec cette recherche', { type: 'warning' })] });
        else if (foundGames.length == 1)
            selectedGame = foundGames[0];
        else {
            const selection = await client.createSelection(interaction, foundGames.slice(0, 20).map(({ info }, i) => { return { label: info.title, description: `${info.category} ${info.console} ${info.version}`, value: String(i) } }));
            if (selection == 'cancel') return;
            selectedGame = foundGames[selection];
        };

        const { title, description, screenshots, version, author, category, console:app_console, icon_url } = selectedGame.info;

        const embed = client.baseEmbed()
        .setColor(client.colors.warning)
        .setAuthor({ name: `${title} • ${app_console} • ${category} • 💀 Ghost eShop 👻` })
        .addField('Informations', `\`\`\`Titre: ${title}\nAuteur: ${author}\nConsole: ${app_console}\nType: ${category}\nVersion: ${version}\n\n${description}\`\`\``)
        .setThumbnail(icon_url)

        let file_description = '';
        for (const file of Object.keys(selectedGame).slice(1)) {
            for (const script of selectedGame[file].script) {
                if (script.type === 'downloadFile') {
                    file_description += `[${file}](${script.file}) • \`${selectedGame[file].size || 'Pas de taille indiquée'}\`\n`;
                    break;
                };
            };
        };

        if (screenshots)
            embed.setImage(screenshots[0].url);

        embed.setDescription(file_description);
        return await interaction.editReply({ components: [], embeds: [embed] });
    }
})
.addStringOption(option => option.setName('game')
    .setDescription('🔎 Paramètre contenant l\'application souhaitée')
    .setRequired(true));

module.exports = GhostEshop;
