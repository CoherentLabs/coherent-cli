const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
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
            if (flags.update && !flags.config) {
                configValid.packagePath = await prompt.askPath();
                saveConfigToFolder('', configValid);
                if (!args.filePath) return;
            }

            let file = {
                type: '',
                path: ''
            };

            try {
                new URL(args.filePath);
                file = {
                    type: 'url',
                    path: args.filePath
                };
            } catch (error) {
                file = {
                    type: 'file',
                    path: path.join(cwd(), args.filePath).replaceAll(`\\`, '/')
                };
            }

            const { player: playerPath } = await getPlayerAndCohtml(configValid.packagePath);

            if (file.type === 'file') {
                if (!fs.existsSync(file.path)) this.error('You need to pass a valid file or URL (with the http:// protocol)');

                if (!fs.lstatSync(file.path).isFile()) this.error('You need to pass a file not directory');

                if (path.extname(file.path) !== '.html') this.error('You need to pass a html file to the Player');
            }

            execFile(playerPath, ['--player', `--url=${file.path}`, '--root'], (err) => {
                if (err) throw new Error(err);
            });
        }
    }
}

PlayerCommand.description = `Opens a file or URL with the Player app

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
