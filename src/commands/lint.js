const { Command, flags } = require('@oclif/command');

const Linter = require('../shared/Linter');
const { extname } = require('path');
const chalk = require('chalk');

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

        const linter = new Linter(args.type, flags.config);

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
