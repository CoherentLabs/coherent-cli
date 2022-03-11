const fs = require('fs-extra');
const path = require('path');
const { version, cwd } = require('process');
const { execSync } = require('child_process');
const chalk = require('chalk');
const glob = require('glob');
const ora = require('ora');
const Spinner = require('@slimio/async-cli-spinner');
const { CONFIG_NAME, CONFIG_EXTENSION, MIN_NODE_VERSION } = require('./config');
const prompt = require('./prompt');
const { ltr } = require('semver');
const boxen = require('boxen');
const fetch = require('node-fetch');
const execa = require('execa');
const { ncp } = require('ncp');

/**
 * Checks if the path provided in the CLI is a Gameface/Prysm package
 * @param {String} path
 * @returns {Boolean | String}
 */
exports.checkPathCorrect = async (path) => {
    if (!fs.statSync(path).isDirectory()) return chalk.redBright('The provided path is not a directory');

    const spinner = ora('\nChecking directory...').start();
    const { player, cohtml } = await this.getPlayerAndCohtml(path);
    spinner.stop();
    spinner.clear();

    if (!player || !cohtml) {
        return chalk.redBright('The provided directory is not a Gameface/Prysm directory');
    }
    return true;
};
/**
 * Gets the path to the player.exe and cohtml.js if they exist
 * @param {String} path
 * @returns {Promise}
 */
exports.getPlayerAndCohtml = (path) => {
    return new Promise((resolve) => {
        const cohtml = glob.sync(`${path}/**/uiresources/library/cohtml.js`)[0];
        const player = glob.sync(`${path}/**/Player.exe`)[0];

        resolve({ player, cohtml });
    });
};

/**
 * Checks if the config passed from the command line is valid
 * @param {String} config - Path to the config
 * @returns {Promise}
 */
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

/**
 * Checks if the folder where the boilerplate will be created already exists
 * @param {String} name
 * @returns {Boolean}
 */
exports.folderExists = (name) => {
    try {
        fs.accessSync(`./${name}`, fs.constants.F_OK);
    } catch (error) {
        return false;
    }

    return true;
};

/**
 * Checks if there are files in the folder where you want to try and create the boilerplate and prompts you to delete them
 * @param {String} name
 * @returns {Promise}
 */
exports.checkFolderOverride = (name) => {
    return new Promise(async (resolve) => {
        if (!isDirEmpty(`./${name}`)) {
            console.log(chalk.yellow(`A folder called ${name} already exists and contains files`));

            const confirm = await prompt.confirm(`Do you want to delete it's contents and create your project inside? `);

            if (!confirm) {
                resolve(false);
                return;
            }

            const spinner = new Spinner().start('Removing files...');

            try {
                await fs.emptyDir(`./${name}`);
                spinner.succeed(`${name} files cleared`);
                resolve(true);
            } catch (error) {
                spinner.failed(`Couldn't clear the contents of ${name}. Try to delete them manually`);
                resolve(false);
            }

            return;
        }

        resolve(true);
    });
};
/**
 * Checks if given directory is empty
 * @param {String} path
 * @returns {Boolean}
 */
const isDirEmpty = (path) => {
    return fs.readdirSync(path).length === 0;
};

/**
 * Checks which of the preconfigured package managers are available on the user machine
 * @param {String} packageManager
 * @returns {Boolean}
 */
exports.checkPackageManager = (packageManager) => {
    try {
        execSync(`${packageManager} -v`, { stdio: 'ignore' });
    } catch (error) {
        return false;
    }

    return true;
};

/**
 * Checks if the user node version is lower than the minimum required to run this CLI
 * @returns {Boolean}
 */
exports.isNodeVersionSupported = () => {
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

/**
 * Converts strings to kebab case to be used as folder names
 * @param {String} str
 * @returns {Boolean}
 */
exports.convertToKebabCase = (str) => {
    return str
        .match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g) //Checks if the string has numbers, capital leters, spaces etc and converts them to dashes (-)
        .filter(Boolean)
        .map((x) => x.toLowerCase())
        .join('-');
};

/**
 * Checks if project name is kebab case
 * @param {String} name
 * @returns {Boolean}
 */
exports.isProjectNameValid = (name) => {
    return name.match(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?\sA-Z]/g)?.length > 0;
};

/**
 * Gets all of the published components
 * @returns {Promise}
 */
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

/**
 * Creates the project folder
 * @param {String} name
 */
exports.createProjectFolder = (name) => {
    try {
        fs.mkdirSync(`./${name}`);
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * Saves the created coh-config to the project folder
 * @param {String} folderName
 * @param {Object} config
 */
exports.saveConfigToFolder = (folderName, config) => {
    try {
        fs.writeFileSync(`./${folderName}/${CONFIG_NAME}${CONFIG_EXTENSION}`, JSON.stringify(config));
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * Creates a task to install the packages from the package.json
 * @param {String} pkgMgr
 * @param {String} targetDirectory
 * @returns {Object}
 */
exports.installPackages = (pkgMgr, targetDirectory) => {
    return {
        title: `Installing packages`,
        enabled: () => true,
        task: () => {
            try {
                execa.sync(pkgMgr, ['i'], {
                    cwd: targetDirectory
                });
            } catch (error) {
                throw new Error(error);
            }
        }
    };
};

/**
 * Creates a task for Listr
 * @param {String} title
 * @param {Function} task
 * @param {Function} enabled
 * @returns {Object}
 */
exports.taskGenerator = (title, task, enabled = () => true) => ({
    title,
    enabled,
    task
});

/**
 * Reads the config from the project folder
 * @param {String} name
 * @returns
 */
exports.readConfig = (name) => {
    return fs.readFileSync(`./${name}/${CONFIG_NAME}${CONFIG_EXTENSION}`);
};
/**
 * Creates a file with a given content
 * @param {String} name
 * @param {String} pathToFile
 * @param {String} content
 */
exports.createFile = (name, pathToFile, content) => {
    pathToFile = path.resolve(cwd(), pathToFile);

    if (!fs.existsSync(pathToFile)) {
        fs.mkdirSync(pathToFile, { recursive: true });
    }
    try {
        fs.writeFileSync(`${pathToFile}/${name}`, content);
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * Creates a folder in the project folder
 * @param {String} name
 * @param {String} pathToFolder
 */
exports.createFolder = (name, pathToFolder) => {
    fs.mkdirSync(`${pathToFolder}/${name}`, { recursive: true });
};

/**
 * Copies files or folders
 * @param {String} src
 * @param {String} dest
 * @returns {Promise}
 */
exports.copyData = (src, dest) => {
    return new Promise((resolve, reject) => {
        ncp(src, dest, (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
};

/**
 * Gets the style file extension based on the preprocessor
 * @param {String} preprocessor
 * @returns {String}
 */
exports.getStyleExtension = (preprocessor) => {
    switch (preprocessor) {
        case 'scss/sass':
            return 'scss';
        case 'less':
            return 'less';
        case 'stylus':
            return 'styl';
        default:
            return 'css';
    }
};
