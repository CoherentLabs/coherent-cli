const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const { execFile, execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { cwd, platform } = require('process');
const { CONFIG_NAME, CONFIG_EXTENSION } = require('../shared/config');
const prompt = require('../shared/prompt');

const { isValidConfig, getPlayerAndCohtml, saveConfigToFolder, isNodeVersionSupported } = require('../shared/utils');
const { glob } = require('glob');

class PlayerCommand extends Command {
    static args = [
        {
            name: 'filePath',
            required: false,
            description: 'the file or url you want to open in the Player',
        },
    ];

    async run() {
        const { flags, args } = this.parse(PlayerCommand);
        const isMac = platform === 'darwin';

        if (!isNodeVersionSupported()) return;

        if (!args.filePath && !flags.update && !flags.config) {
            console.log(
                chalk.yellowBright(
                    'If you want to open a file you need to pass the path to it otherwise you can update the package in the config using the --update flag'
                )
            );
            return;
        }
        const configPath = flags.config || `./${CONFIG_NAME}${CONFIG_EXTENSION}`;
        const configValid = await isValidConfig(configPath); //Checking if it's a valid config

        if (!configValid?.packagePath) {
            console.log(chalk.redBright('The coh-config.json file is not created for a Gameface/Prysm project'));
            return;
        }

        if (flags.update) {
            if (!args.filePath) return;
            configValid.packagePath = await prompt.askPath();
            saveConfigToFolder('', configValid);
        }

        let file = {
            type: '',
            path: '',
        };

        try {
            new URL(args.filePath);
            file = {
                type: 'url',
                path: args.filePath,
            };
        } catch (error) {
            file = {
                type: 'file',
                path: path.join(cwd(), args.filePath).replaceAll(`\\`, '/'),
            };
        }

        if (file.type === 'file') this.validateFile(file.path);

        if (isMac) return this.handleMac(configValid.packagePath, file.path);

        this.handleWin(configValid.packagePath, file.path);
    }
    validateFile(filePath) {
        if (!fs.existsSync(filePath)) this.error('You need to pass a valid file or URL (with the http:// protocol)');

        if (!fs.lstatSync(filePath).isFile()) this.error('You need to pass a file not directory');

        if (path.extname(filePath) !== '.html') this.error('You need to pass a html file to the Player');
    }

    handleWin(packagePath, fileToOpen) {
        const { player: playerPath } = getPlayerAndCohtml(packagePath);

        execFile(playerPath, ['--player', `--url=${fileToOpen}`, '--root'], (err) => {
            if (err) throw new Error(err);
        });
    }

    handleMac(packagePath, fileToOpen) {
        const macPath = glob.sync(`${packagePath}/**/CohtmlPlayer.app`)[0];
        try {
            execSync(`chmod +x ${macPath}/Contents/MacOS/CohtmlPlayer`);
        } catch (error) {
            throw new Error(err);
        }
        try {
            execSync(`open ${macPath} --args --player --url=${fileToOpen}`);
        } catch (error) {
            throw new Error(err);
        }
    }
}

PlayerCommand.description = `Opens a file or URL with the Player app

`;

PlayerCommand.flags = {
    config: flags.string({
        description: 'set path to config',
    }),
    update: flags.boolean({
        description: 'update the package path in the config',
        exclusive: ['config'],
    }),
};

module.exports = PlayerCommand;
