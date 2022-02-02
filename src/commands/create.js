const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const config = require('../shared/config');
const CreateConfig = require('../shared/CreateConfig');
const Creator = require('../shared/Creator');
const { checkFolderOverride, isProjectNameValid, convertToKebabCase, folderExists, checkNodeVersion } = require('../shared/utils');
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
        if (!checkNodeVersion()) return;
        
        let name = args.name;
        if (isProjectNameValid(name)) {
            name = convertToKebabCase(name);
            console.log(chalk.yellowBright(`${args.name} contains capital letters or special characters that are not permited. We'll convert it to ${name}`));
        }

        const doesFolderExist = folderExists(name);

        if (doesFolderExist) {
            const folderOverride = await checkFolderOverride(name);
            if (!folderOverride) return;
        }

        const createConfig = new CreateConfig({
            name,
            type: flags.type,
            isDefault: flags.default,
            configPath: flags.config,
            makeNewFolder: !doesFolderExist
        });

        await createConfig.init();

        const boilerplate = new Creator(name);

        console.log(boxen('Project is setting up. Please wait...', { padding: 1 }));

        try {
            await boilerplate.create();
            console.log(`${chalk.greenBright('Project set up successfully')}`);
        } catch (error) {
            console.log(`${chalk.redBright("Project wasn't set up successfully")}`);
        }
    }
}

CreateCommand.description = `Create a project
...
Create boilerplates quickly. Use coherent-cli create --help for more information
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
