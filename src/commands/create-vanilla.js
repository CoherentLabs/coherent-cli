const { Command, flags } = require('@oclif/command');

class CreateVanillaCommand extends Command {
    async run() {
        const { flags } = this.parse(CreateVanillaCommand);
    }
}

CreateVanillaCommand.description = `Creates 
...
Extra documentation goes here
`;

CreateVanillaCommand.flags = {
    default: flags.string({
        char: 'default',
        description: 'set up a default vanilla js project'
    })
};

module.exports = CreateVanillaCommand;
