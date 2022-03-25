module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });
    require('../Components/NXBrew');

    async function event() {
        client.appInfo = await client.fetchApplication();
        setInterval(async() => {
            client.appInfo = await client.fetchApplication();
        }, 60000);
        client.user.setActivity(`-help | NXBot Warez`, {
            type: 'PLAYING'
        });
        console.log(`✔ ${client.user.tag} est maintenant en ligne.`);
    };

    event.listener = 'ready';

    return event;
};
