const CommandStructure = require('../../utils/structures/CommandStructure');
const fetch = require('node-fetch');

const CDN = new CommandStructure({
    name: 'cdn',
    description: '🌐 Effectue une recherche sur le CDN de SigHya',
    category: '💀 Warez',
    run: async (client, interaction) => {
        const game = interaction.options.getString('game');

        const api = await fetch('fichier.json').catch(async e => {
            await interaction.editReply({ embeds: [client.createEmbed(interaction, '**Une erreur est survenue** lors de l\'accès à l\'API', { type: 'warning' })] });
            return false;
        });

        if (!api) return;
        const { ok, status, statusText } = api;

        if (!ok)
            return await interaction.editReply({ embeds: [client.createEmbed(interaction, `**Une erreur est survenue** \`Code: ${status} - ${statusText}\``, { type: 'warning' })] });

        const SigHyaCDN = await api.json().then(api => {
            let files = [];
            for (const type of Object.keys(api)) {
                for (const file in api[type])
                    api[type][file].category = type;
                files = [...files, ...api[type]];
            }
            return files;
        });

        const foundGames = SigHyaCDN.filter(({ title }) => client.compareText(title, game));
        let selectedGame;

        if (!foundGames.length)
            return await interaction.editReply({ embeds: [client.createEmbed(interaction, 'Aucun jeu n\'a été trouvé avec cette recherche', { type: 'warning' })] });
        else if (foundGames.length == 1)
            selectedGame = foundGames[0];
        else {
            const selection = await client.createSelection(interaction, foundGames.slice(0, 20).map((file, i) => { return { label: file.title, description: `${file.category} ${file.console} ${file.version}`, value: String(i) } }));
            if (selection == 'cancel') return;
            selectedGame = foundGames[selection];
        };

        const { title, region, author, console:app_console, version, category, size, download, screenshots:screenshot, description } = selectedGame;

        const embed = client.baseEmbed()
        .setColor(interaction.memberColor)
        .setAuthor({ name: `${title} • ${app_console} • ${category} • 💀 SigHya CDN 🌐` })
        .addField('Informations', `\`\`\`Titre: ${title}\nAuteur: ${author}\nConsole: ${app_console}\nType: ${category}\nVersion: ${version}\nRégion: ${region}\n\n${description}\`\`\``)
        .setThumbnail(screenshot)
        .setDescription(`${download.map((dl, i) => {
           const [ fileType, link ] = dl.split(' : ');
           return link ? `[${title} • ${category} • ${fileType}](${link}) • \`${i+1}/${download.length}\`` : `[${title} • ${category}](${dl}) • \`${i+1}/${download.length}\``
        }).join('\n')}\n**Taille totale:** \`${size}\``)
        
        return await interaction.editReply({ components: [], embeds: [embed] });
    }
})
.addStringOption(option => option.setName('game')
    .setDescription('🔎 Paramètre contenant l\'application souhaitée')
    .setRequired(true));

module.exports = CDN;
