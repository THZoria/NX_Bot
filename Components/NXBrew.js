const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());
const { writeFileSync } = require('fs');

const initNXBrew = async () => {
    const browser = await puppeteer.launch({args: ['--disable-setuid-sandbox', '--disable-gpu', '--no-first-run', '--no-sandbox']});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    await page.goto('https://nxbrew.com/list-of-games/', {
        waitUntil: 'networkidle2'
    }).catch(({stack}) => console.error(stack));

    const games = await page.$$('.items-inner > .letter-section > ul > li > a');

    const obj = { games: [] };

    for (const game of games) {
        const [ gameName, gameLink ] = await game.evaluate(({textContent, href}) => [textContent.trim().replace('\n', ''), href]);
        obj.games.push([gameName, gameLink]);
    };

    writeFileSync('./Databases/NXBrew.json', JSON.stringify(obj));
    await browser.close();
    console.log('NXBrew Reloaded!');
};

initNXBrew();
setInterval(initNXBrew, 1800000);
