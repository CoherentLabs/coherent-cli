const { Command, flags } = require('@oclif/command');

class LintCommand extends Command {
    async run() {}
}

LintCommand.description = `Describe the command here
...
Extra documentation goes here
`;

LintCommand.flags = {};

module.exports = LintCommand;
