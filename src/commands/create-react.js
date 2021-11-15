const { Command, flags } = require('@oclif/command');

class CreateReactCommand extends Command {
    async run() {
    }
}

CreateReactCommand.description = `Describe the command here
...
Extra documentation goes here
`;

CreateReactCommand.flags = {};

module.exports = CreateReactCommand;
