const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const CreateConfig = require('../shared/CreateConfig');
const { checkFolderExists, checkFolderOverride, checkProjectName, convertToKebabCase } = require('../shared/utils');

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

        createConfig.init();
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
        options: ['vanilla', 'typescript', 'react', 'preact']
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
