const { Command, flags } = require('@oclif/command');

const Linter = require('../shared/Linter');
const { extname } = require('path');
const { existsSync } = require('fs-extra');
const chalk = require('chalk');
const { isNodeVersionSupported } = require('../shared/utils');

class LintCommand extends Command {
    static args = [
        {
            name: 'type',
            required: true,
            description: 'type of linter you want to run',
            options: ['html', 'css']
        }
    ];

    async run() {
        const { flags, args } = this.parse(LintCommand);

        if (!isNodeVersionSupported()) return;

        const linter = new Linter(args.type);

        if (flags.fileName && !existsSync(flags.fileName)) {
            console.log(chalk.redBright("The file you have provided doesn't exist"));
            return;
        }

        if (flags.fileName && extname(flags.fileName) !== `.${args.type}`) {
            console.log(chalk.redBright("The file you have provided can't be linted by this linter"));
            return;
        }

        const fileName = flags.fileName || `**/*.${args.type}`;

        await linter.init();

        linter.lint(fileName);
        if (flags.watch) linter.watch();
    }
}

LintCommand.description = `Runs the cohtml linters

`;

LintCommand.flags = {
    fileName: flags.string({
        description: 'file that you want to lint',
        exclusive: ['watch']
    }),
    watch: flags.boolean({
        char: 'W',
        description: 'watch files for changes'
    })
};

module.exports = LintCommand;
