//Changed the line 143 to assign the NXBot log room on your discord (modified "id_channel")

module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });

    const Pagination = require('discord-paginationembed');
    const puppeteer = require('puppeteer-extra');
    const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
    puppeteer.use(AdblockerPlugin());
    const { deburr } = require('lodash');

    async function command(message, args) {
        const browser = await puppeteer.launch({args: ['--disable-setuid-sandbox', '--disable-gpu', '--no-first-run', '--no-sandbox']});
        const page = await browser.newPage();

        const filter = m => m.author.id === message.author.id;
        
        const search = args.join('');
        if (!search) {
            await browser.close();
            return message.channel.send('Veuillez indiquer votre recherche.');
        };

        const { games } = JSON.parse(fs.readFileSync('./Databases/NXBrew.json'));        
        const foundGames = [];
        for (const [ gameName, gameLink ] of games) {
            if (deburr(gameName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')).includes(deburr(search.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''))) && foundGames.length <= 9)
                foundGames.push([gameName, gameLink]);
        };

        let [ gameName, gameLink ] = [];

        if (foundGames.length == 0) {
            await browser.close();
            return message.channel.send('Aucun résultat de trouvé avec cette recherche');
        } else if (foundGames.length == 1)
            [ gameName, gameLink ] = foundGames[0];
        else {
            const embed = new MessageEmbed()
            .setTitle('Recherche NXBrew')
            .setDescription(`Nous avons trouvé ${foundGames.length} résultats pour votre recherche.\n\`\`\`${foundGames.map((game, i) => `[${i+1}] - ${game[0]}`).join('\n')}\`\`\``)
            .setColor(message.member.roles.highest.color)
            .addField(message.author.tag, 'Veuillez envoyer le numéro correspondant à votre recherche, si elle n\'est pas présente dans les résultats, envoyez annuler et recommencez en étant plus précis.')
            let msg = await message.channel.send(embed);
            let index = await message.channel.awaitMessages(filter, { max: 1, time: 60000 }).then(msg => { return msg.size === 0 ? false : msg.first().content });

            if (!index) {
                msg.delete();
                await browser.close();
                return message.channel.send('Vous n\'avez pas indiqué votre recherche dans le délai imparti');
            } else if (index.toLowerCase() === 'annuler') {
                msg.delete();
                await browser.close();
                return message.channel.send('Vous avez décidé d\'annuler votre recherche');
            } else if (isNaN(index) || index < 1 || index > foundGames.length) {
                msg.delete();
                await browser.close();
                return message.channel.send('Ce que vous recherchez est introuvable');
            };
            msg.delete();
            [ gameName, gameLink ] = foundGames[index - 1];
        };
    
        const msg = await message.channel.send(`Je suis en train de récupérer les liens de **${gameName}** (~10s)`);

        await page.goto(gameLink, {
            waitUntil: 'networkidle2'
        }).catch(({stack}) => console.error(stack));
    
        let gameInfos = await (await page.$('#content > div.content > div > article > div.entry > div.wp-block-media-text.alignwide.has-very-light-gray-background-color > div > p.has-background.has-medium-font-size.has-very-light-gray-background-color')).evaluate(infos => infos.innerText);
        const gamePicture = await (await page.$('#content > div.content > div > article > div.entry > div.wp-block-media-text.alignwide.has-very-light-gray-background-color > figure > img')).evaluate(picture => picture.src);
        const password = await (await page.$('.has-background.has-luminous-vivid-amber-background-color'))?.evaluate(password => password.textContent) || false;

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
        let textExport = '';

        for (const linkType of Object.keys(links)) {
            let type = '';
            let linkArr = [];
            for (const service of Object.keys(links[linkType])) {
                type += service == 'Service Not Specified' ? '' : `\n**${service}**\n`; 
                linkArr.push(service == 'Service Not Specified' ? '' : `\n**${service}**\n`);
                for (let [ linkName, linkUrl, base64 ] of links[linkType][service]) {
                    linkUrl = base64 ? Buffer.from(base64, 'base64').toString('utf-8') : linkUrl;
                    ;
                    type += `**[${base64 ? '[BASE64] - Get decrypted links' : linkName}](${linkUrl})**\n`;
                    linkArr.push(`**[${linkName}](${linkUrl})**\n`);
                };
            };

            textExport += `[${linkType}]\n${type.replaceAll('*', '')}\n`;
            
            if (linkType.length + type.length > 2048) {
                let multiFields = new MessageEmbed()                
                let i = 0;

                while (i !== linkArr.length - 1) {
                    let field = '';

                    if (linkArr[i].length > 1024)
                        ++i;

                    while (field.length + linkArr[i].length <= 1024)
                        field += linkArr[i++];

                    multiFields.addField(linkType, field, true);
                };

                embeds.push(multiFields);
            } else 
                embeds.push(new MessageEmbed().setDescription(`**${linkType}**\n${type}`));    
        };

        if (password) {
            gameInfos += `\n${password}`;
            textExport += password;
        };

        let attachment = new MessageAttachment(Buffer.from(textExport, 'utf-8'), `${gameName} - TextExport.txt`);
        let textExportLink = (await client.channels.cache.get('id_channel').send(attachment)).attachments.first().url;

        new Pagination.Embeds()
        .setArray(embeds)
        .setPageIndicator('footer', (page, pages) => `Page ${page} / ${pages} [${Object.keys(links)[page - 1]}]`)
        .setChannel(message.channel)
        .setAuthorizedUsers([message.author.id])
        .setClientAssets({ msg, prompt: `\`\`\`${Object.keys(links).map((type, i) => `[Page ${i + 1}] - ${type}`).join('\n')}\`\`\`\n{{user}} veuillez indiquer la page que vous voulez voir, vous pouvez taper \`0\` pour annuler` })
        .setTitle(gameName)
        .addField('Text Export', `**[Download Text Export](${textExportLink})**`)
        .addField('Infos', `\`\`\`${gameInfos}\`\`\``)
        .setURL(gameLink)
        .setThumbnail(gamePicture)
        .setColor(message.member.roles.highest.color)
        .setFooter('NXBrew', message.author.displayAvatarURL({ format: 'png', dynamic: false, size: 2048 }))
        .build();

        msg.delete();
        await browser.close();
    };

    command.options = {
        name: ['nxbrew'],
        show: 'NXBrew 💀',
        description: `Cette commande vous permet de rechercher un jeu sur NXBrew.`,
        category: 'Hack 💀',
        usage: '-nxbrew [Recherche]',
        ex: '-nxbrew Zelda',
        enabled: true,
        nsfw: false,
        reqUsrPerms: [],
        reqBotPerms: [],
        ownerOnly: false
    };

    return command;
};
