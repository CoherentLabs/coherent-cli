const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const { execFile } = require('child_process');
const path = require('path');
const { cwd } = require('process');
const { CONFIG_NAME, CONFIG_EXTENSION } = require('../shared/config');
const prompt = require('../shared/prompt');

const { readConfig, checkValidConfig, getPlayerAndCohtml, saveConfigToFolder } = require('../shared/utils');

class PlayerCommand extends Command {
    static args = [
        {
            name: 'filePath',
            required: false,
            description: 'the file or url you want to open in the Player'
        }
    ];

    async run() {
        const { flags, args } = this.parse(PlayerCommand);
        if (!args.filePath && !flags.update) {
            console.log(
                chalk.yellowBright('If you want to open a file you need to pass the path to it otherwise you can update the package in the config using the --update flag')
            );
            return;
        }
        const configPath = flags.config || `./${CONFIG_NAME}${CONFIG_EXTENSION}`;
        const configValid = await checkValidConfig(configPath); //Checking if it's a valid config

        if (configValid) {
            if (flags.update) {
                configValid.packagePath = await prompt.askPath();
                saveConfigToFolder('', configValid);
                if (!args.filePath) return;
            }

            const pathToFile = path.join(cwd(), args.filePath).replaceAll(`\\`, '/');
            const { player: playerPath } = await getPlayerAndCohtml(configValid.packagePath);
            execFile(playerPath, ['--player', `--url=${pathToFile}`, '--root'], (err) => {
                if (err) throw new Error(err);
            });
        }
    }
}

PlayerCommand.description = `Describe the command here
...
Extra documentation goes here
`;

PlayerCommand.flags = {
    config: flags.string({
        description: 'set path to config'
    }),
    update: flags.boolean({
        description: 'update the package path in the config'
    })
};

module.exports = PlayerCommand;
