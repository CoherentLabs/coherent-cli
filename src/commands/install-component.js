const { Command, flags } = require('@oclif/command');

class InstallComponentCommand extends Command {
    async run() {}
}

InstallComponentCommand.description = `Describe the command here
...
Extra documentation goes here
`;

InstallComponentCommand.flags = {};

module.exports = InstallComponentCommand;
