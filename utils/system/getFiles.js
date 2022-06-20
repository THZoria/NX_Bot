const { existsSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

function getFiles(directory, output=[]) {
    if (existsSync(directory)) {
        const files = readdirSync(directory);
        for (const file of files) {
            const name = `${directory}/${file}`;
            if (statSync(name).isDirectory()) 
                getFiles(name, output);
            else
                output.push(join(process.cwd(), name));
        };
    };
    return output;
};

module.exports = getFiles;
