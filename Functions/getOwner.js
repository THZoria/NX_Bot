module.exports = (variables) => {
    Object.keys(variables).map(variable => {
        global[variable] = variables[variable];
    });

    variables.getOwner = () => {
        const ownersList = [];
        for (let owner of owners) {
            let own = client.users.cache.get(owner);
            if (own) ownersList.push(own);
        };
        return ownersList;
    };
};