const { Command, flags } = require('@oclif/command');

class PlayerCommand extends Command {
    async run() {}
}

PlayerCommand.description = `Describe the command here
...
Extra documentation goes here
`;

PlayerCommand.flags = {};

module.exports = PlayerCommand;
