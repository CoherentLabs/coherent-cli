const fs = require('fs');
const path = require('path');
const { cwd, version } = require('process');
const { execSync } = require('child_process');
const chalk = require('chalk');
const glob = require('glob');
const ora = require('ora');
const { CONFIG_NAME, CONFIG_EXTENSION, MIN_NODE_VERSION } = require('./config');
const prompt = require('./prompt');
const { ltr } = require('semver');
const boxen = require('boxen');
const fetch = require('node-fetch');
const { resolve } = require('path');

exports.checkPathCorrect = async (path) => {
    if (!fs.statSync(path).isDirectory()) return chalk.redBright('The provided path is not a directory');

    const spinner = ora('\nChecking directory...').start();
    const { player, cohtml } = await getPlayerAndCohtml(path);
    spinner.stop();
    spinner.clear();

    console.log(player, cohtml);

    if (!player || !cohtml) {
        return chalk.redBright('The provided directory is not a Gameface/Prysm directory');
    }
    return true;
};

const getPlayerAndCohtml = (path) => {
    return new Promise((resolve) => {
        const cohtml = glob.sync(`${path}/**/uiresources/library/cohtml.js`)[0];
        const player = glob.sync(`${path}/**/Player.exe`)[0];

        resolve({ player, cohtml });
    });
};

exports.CohtmlAndPlayerPaths = async (path) => await getPlayerAndCohtml(path);

exports.checkValidConfig = async (config) => {
    return new Promise((resolve) => {
        if (path.basename(config) !== `${CONFIG_NAME}${CONFIG_EXTENSION}`) {
            console.log(chalk.redBright(`${config} is not a correct config name`));
            resolve(false);
            return;
        }
        try {
            fs.accessSync(config, fs.constants.F_OK);
        } catch (error) {
            console.log(chalk.redBright(`No file found at ${config}`));
            resolve(false);
            return;
        }

        const json = JSON.parse(fs.readFileSync(config));

        const isValidConfig = ['name', 'type', 'cohtmlUse'].every((el) => json.hasOwnProperty(el));

        if (!isValidConfig) {
            console.log(chalk.redBright(`${config} is not a valid config`));
            resolve(false);
            return;
        }

        resolve(json);
    });
};

exports.checkFolderExists = (name) => {
    return new Promise((resolve) => {
        try {
            fs.accessSync(`./${name}`, fs.constants.F_OK);
        } catch (error) {
            resolve(false);
            return;
        }

        resolve(true);
    });
};

exports.checkFolderOverride = (name) => {
    return new Promise(async (resolve) => {
        if (!isDirEmpty(`./${name}`)) {
            console.log(chalk.yellow(`A folder called ${name} already exists and contains files`));

            const confirm = await prompt.confirm(`Do you want to delete it's contents and create your project inside? `);

            if (!confirm) {
                resolve(false);
                return;
            }

            const spinner = ora('Removing files...').start();

            clearFolderContents(`./${name}`)
                .then(() => {
                    spinner.succeed(`${name} files cleared`);
                    resolve(true);
                    return;
                })
                .catch(() => {
                    spinner.fail(`Couldn't clear the contents of ${name}. Try to delete them manually`);
                    resolve(false);
                    return;
                });
        }

        resolve(true);
    });
};

const isDirEmpty = (path) => {
    return fs.readdirSync(path).length === 0;
};

const clearFolderContents = (pathToFolder) => {
    return new Promise((resolve, reject) => {
        const files = fs.readdirSync(path.join(cwd(), pathToFolder));
        for (const file of files) {
            try {
                fs.rmSync(path.join(cwd(), `${pathToFolder}/${file}`), { recursive: true });
            } catch (error) {
                reject();
                return;
            }
        }
        resolve();
    });
};

exports.checkPackageManager = (packageManager) => {
    try {
        execSync(`${packageManager} -v`, { stdio: 'ignore' });
    } catch (error) {
        return false;
    }

    return true;
};

exports.checkNodeVersion = () => {
    if (ltr(version, MIN_NODE_VERSION)) {
        console.log(
            boxen(
                chalk.redBright(
                    `Your version of NodeJS ${version} is lower than the minimum required version (${MIN_NODE_VERSION}) to run this command. You can download the latest version of NodeJS from https://nodejs.org/en/download/`
                ),
                { padding: 1 }
            )
        );
        return false;
    }

    return true;
};

exports.convertToKebabCase = (str) => {
    return str
        .match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
        .filter(Boolean)
        .map((x) => x.toLowerCase())
        .join('-');
};

exports.checkProjectName = (name) => {
    return name.match(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?\sA-Z]/g).length > 0;
};

exports.getCoherentPackages = () => {
    return new Promise((resolve) => {
        const spinner = ora('Fetching components...').start();

        fetch('https://api.npms.io/v2/search?q=coherent-gameface', { method: 'Get' })
            .then((res) => res.json())
            .then((data) => {
                const components = data.results.reduce((acc, el) => {
                    if (el.package?.keywords?.includes('Component')) {
                        acc.push({ name: el.package.name });
                    }
                    return acc;
                }, []);

                return Promise.resolve(components);
            })
            .then((components) => {
                spinner.stop();
                resolve(components);
            });
    });
};

exports.createProjectFolder = (name) => {
    try {
        fs.mkdirSync(`./${name}`);
    } catch (error) {
        throw new Error(error);
    }
};

exports.saveConfigToFolder = (folderName, config) => {
    try {
        fs.writeFileSync(`./${folderName}/${CONFIG_NAME}${CONFIG_EXTENSION}`, JSON.stringify(config));
    } catch (error) {
        throw new Error(error);
    }
};
