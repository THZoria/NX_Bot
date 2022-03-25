const variables = {};
require('./Components/Variables.js')(variables);
require('dotenv').config();
Object.keys(variables).map(variable => {
    global[variable] = variables[variable]
});

client.setMaxListeners(Infinity);

if (fs.existsSync('./Functions')) {
    let functions = getFiles('./Functions').filter(f => f.endsWith('.js'));
    for (let i = 0; i < functions.length; i++) {
        require(functions[i])(variables);
    };
};

if (fs.existsSync('./Commands')) {
    let commands = getFiles('./Commands').filter(f => f.endsWith('.js'));
    for (let i = 0; i < commands.length; i++) {
        require(commands[i]);
    };
};

let events = getFiles('./Events').filter(f => f.endsWith('.js'));

events.map(event => {
    let func = require(event)(variables);
    listeners.push([func.listener, func]);
    client.on(func.listener, func);
})

client.login(process.env.TOKEN);