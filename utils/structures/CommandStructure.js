const { SlashCommandBuilder } = require('@discordjs/builders');

class CommandStructure extends SlashCommandBuilder {
    constructor({
        name = null,
        description = null,
        category = null,
        enabled = true,
        permissions = {
            clientPermissions: null,
            userPemissions: null
        },
        run = null
    }) {
        super();
        this.name = name;
        this.description = description;
        this.category = category;
        this.enabled = enabled;
        this.permissions = permissions;
        this.run = run;
    
        this.setName(this.name);
        this.setDescription(`[${this.category}] • ${this.description}`);
        this.setDefaultPermission(!this.ownerOnly);

        if (!this.enabled)
            this.run = async (client, interaction) => {
                return await interaction.editReply({ embeds: [client.createEmbed('**Cette commande** est actuellement __indisponible__', { type: 'warning' })] })
            };
    };
};

module.exports = CommandStructure;
