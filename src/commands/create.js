const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const Spinner = require('@slimio/async-cli-spinner');
const config = require('../shared/config');
const CreateConfig = require('../shared/CreateConfig');
const Creator = require('../shared/Creator');
const { checkFolderExists, checkFolderOverride, checkProjectName, convertToKebabCase } = require('../shared/utils');
const boxen = require('boxen');

class CreateCommand extends Command {
    static args = [
        {
            name: 'name',
            required: true,
            description: 'the name of your project'
        }
    ];

    async run() {
        const { flags, args } = this.parse(CreateCommand);
        let name = args.name;
        const nameCheck = checkProjectName(name);
        if (nameCheck) {
            name = convertToKebabCase(name);
            console.log(chalk.yellowBright(`${args.name} contains capital letters or special characters that are not permited. We'll convert it to ${name}`));
        }

        const folderCheck = await checkFolderExists(name);
        if (folderCheck) {
            const folderOverride = await checkFolderOverride(name);
            if (!folderOverride) return;
        }

        const createConfig = new CreateConfig({
            name,
            type: flags.type,
            isDefault: flags.default,
            configPath: flags.config,
            makeNewFolder: !folderCheck
        });

        await createConfig.init();

        const boilerplate = new Creator(name);

        const spinner = new Spinner().start('Setting up project. Please wait...');

        try {
            await boilerplate.create();
            spinner.succeed('Project set up successfully');
        } catch (error) {
            spinner.failed(`Project wasn't set up successfully`)
        }
    }
}

CreateCommand.description = `Create a project
...
Extra documentation goes here
`;

CreateCommand.flags = {
    type: flags.string({
        char: 't',
        description: 'choose the type of project to set up',
        options: config.TYPES
    }),
    default: flags.boolean({
        char: 'd',
        description: 'set up project with default options',
        dependsOn: ['type']
    }),
    config: flags.string({
        description: 'use a preexisting config'
    })
};

module.exports = CreateCommand;
