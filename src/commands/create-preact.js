const { Command, flags } = require('@oclif/command');

class CreatePreactCommand extends Command {
    async run() {}
}

CreatePreactCommand.description = `Describe the command here
...
Extra documentation goes here
`;

CreatePreactCommand.flags = {};

module.exports = CreatePreactCommand;
