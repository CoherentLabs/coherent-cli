const { Command, flags } = require('@oclif/command');

class CreateMockModelCommand extends Command {
    async run() {}
}

CreateMockModelCommand.description = `Describe the command here
...
Extra documentation goes here
`;

CreateMockModelCommand.flags = {};

module.exports = CreateMockModelCommand;
