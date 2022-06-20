const CommandStructure = require('../../utils/structures/CommandStructure');
const { readFileSync } = require('fs');
const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());

const NXBrew = new CommandStructure({
    name: 'nxbrew',
    description: '💀 Affiche des informations sur une application Nintendo Switch',
    category: '💀 Warez',
    run: async (client, interaction) => {
        const game = interaction.options.getString('game');
        const foundGames = JSON.parse(readFileSync('./databases/NXBrew.json')).games.filter(g => client.compareText(g[0], game));
        let selectedGame;

        if (!foundGames.length)
            return await interaction.editReply({ embeds: [client.createEmbed(interaction, 'Aucun jeu n\'a été trouvé avec cette recherche', { type: 'warning' })] });
        else if (foundGames.length == 1)
            selectedGame = foundGames[0];
        else {
            const selection = await client.createSelection(interaction, foundGames.slice(0, 20).map((g, i) => { return { label: g[0].substring(0, 99), description: 'Aucune description à afficher', value: String(i) } }));
            if (selection == 'cancel') return;
            selectedGame = foundGames[selection];
        };

        await interaction.editReply({ embeds: [client.createEmbed(interaction, '**Récupération** des liens en cours, __veuillez patienter__...', { type: 'warning' })] });
        const browser = await puppeteer.launch({args: ['--disable-setuid-sandbox', '--disable-gpu', '--no-first-run', '--no-sandbox']});
        const page = await browser.newPage();

        await page.goto(selectedGame[1], {
            waitUntil: 'networkidle2'
        }).catch(({stack}) => console.error(stack));

        const gamePicture = await (await page.$('#content > div.content > div > article > div.entry > div.wp-block-media-text.alignwide.has-very-light-gray-background-color > figure > img')).evaluate(picture => picture.src);

        const links = {};
        const gameLinks = await page.$$('.wp-block-columns.has-2-columns');
    
        for (const gameLink of gameLinks) {
            const type = await (await gameLink.$('.wp-block-column:nth-child(1) > p > strong')).evaluate(type => type.textContent);
            links[type] = {};
            for (const service of await gameLink.$$('.wp-block-column:nth-child(2) > p')) {
                const serviceName = await service.evaluate(service => { return service.querySelector('strong')?.textContent || 'Service Not Specified' });
                let base64 = (await service.evaluate(service => service.textContent)).replace(service, '').replace(serviceName, '');

                if (!new RegExp('(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)').test(base64))
                    base64 = false;
                
                links[type][serviceName] = [];
                for (const link of await service.$$('a')) {
                    const [ linkName, linkUrl, hasBase64 ] = (await link.evaluate(link => [link.textContent, link.href])).concat(base64);
                    links[type][serviceName].push([ linkName, linkUrl, hasBase64 ]);
                };
            };
        };

        const embeds = [];
        
        for (const linkType of Object.keys(links)) {
            let type = '';
            let linkArr = [];
            for (const service of Object.keys(links[linkType])) {
                type += service == 'Service Not Specified' ? '' : `\n**${service}**\n`; 
                linkArr.push(service == 'Service Not Specified' ? '' : `\n**${service}**\n`);
                for (let [ linkName, linkUrl, base64 ] of links[linkType][service]) {
                    linkUrl = base64 ? Buffer.from(base64, 'base64').toString('utf-8') : linkUrl;
                    type += `**[${base64 ? '[BASE64] - Get decrypted links' : linkName}](${linkUrl})**\n`;
                    linkArr.push(`**[${linkName}](${linkUrl})**\n`);
                };
            };       
            
            if (linkType.length + type.length > 2048) {
                let embedFields = [];
                let i = 0;

                while (i !== linkArr.length - 1) {
                    let field = '';

                    if (linkArr[i].length > 1024)
                        ++i;

                    while (field.length + linkArr[i].length <= 1024)
                        field += linkArr[i++];

                    embedFields.push({ name: linkType, value: field, inline: true });
                };
                
                const pageEmbed = client.baseEmbed()
                .setColor(client.colors.error)
                .setAuthor({ name: `${selectedGame[0]} • 💀 NXBrew 📦`, url: selectedGame[1] })
                .setThumbnail(gamePicture);

                pageEmbed.fields = embedFields;
                embeds.push(pageEmbed);
            } else {
                const pageEmbed = client.baseEmbed()
                .setColor(client.colors.error)
                .setAuthor({ name: `${selectedGame[0]} • 💀 NXBrew 📦`, url: selectedGame[1] })
                .setThumbnail(gamePicture)
                .setDescription(`**${linkType}**\n${type}`);
                embeds.push(pageEmbed);
            };
        };
        
        await browser.close();
        if (embeds.length == 1)
            return await interaction.editReply({ embeds: [embeds[0]] });
        else
            return await client.createEmbedButtons(interaction, embeds);
    }
})
.addStringOption(option => option.setName('game')
    .setDescription('🔎 Paramètre contenant l\'application souhaitée')
    .setRequired(true));;

module.exports = NXBrew;
