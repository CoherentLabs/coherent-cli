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

/**
 * Checks if the path provided in the CLI is a Gameface/Prysm package
 * @param {string} path
 * @returns {boolean | string}
 */
exports.isPathCorrect = (path) => {
    if (!fs.existsSync(path)) return chalk.redBright("The provided path doesn't exist");

    if (!fs.statSync(path).isDirectory()) return chalk.redBright('The provided path is not a directory');

    const spinner = ora('\nChecking directory...').start();
    const { player, cohtml } = this.getPlayerAndCohtml(path);
    spinner.stop();
    spinner.clear();

    if (player && cohtml) return true;
    return chalk.redBright('The provided directory is not a Gameface/Prysm directory');
};
/**
 * Gets the path to the player.exe and cohtml.js if they exist
 * @param {string} path
 * @returns {Object}
 */
exports.getPlayerAndCohtml = (path) => {
    const cohtml = glob.sync(`${path}/**/library/cohtml.js`)[0];
    const player = glob.sync(`${path}/**/Player.exe`)[0];

    return { player, cohtml };
};

/**
 * Checks if the config passed from the command line is valid
 * @param {string} config - Path to the config
 * @returns {JSON | boolean}
 */
exports.isValidConfig = async (config) => {
    if (path.basename(config) !== `${CONFIG_NAME}${CONFIG_EXTENSION}`) {
        console.log(chalk.redBright(`${config} is not a correct config name`));
        return false;
    }

    try {
        fs.accessSync(config, fs.constants.F_OK);
    } catch (error) {
        console.log(chalk.redBright(`No file found at ${config}`));
        return false;
    }

    const properties = ['name', 'type', 'cohtmlUse'];

    const json = JSON.parse(fs.readFileSync(config));

    const isValidConfig = properties.every((el) => json.hasOwnProperty(el));

    if (isValidConfig) return json;

    console.log(chalk.redBright(`${config} is not a valid config`));
    return false;
};

/**
 * Checks if the folder where the boilerplate will be created already exists
 * @param {string} name
 * @returns {boolean}
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
 * @param {string} name
 * @returns {boolean}
 */
exports.checkFolderOverride = async (name) => {
    if (isDirEmpty(`./${name}`)) return true;

    console.log(chalk.yellow(`A folder called ${name} already exists and contains files`));

    const confirm = await prompt.confirm(`Do you want to delete it's contents and create your project inside? `);

    if (!confirm) {
        return false;
    }

    const spinner = new Spinner().start('Removing files...');

    try {
        await fs.emptyDir(`./${name}`);
        spinner.succeed(`${name} files cleared`);
        return true;
    } catch (error) {
        spinner.failed(`Couldn't clear the contents of ${name}. Try to delete them manually`);
        return false;
    }
};
/**
 * Checks if given directory is empty
 * @param {string} path
 * @returns {boolean}
 */
const isDirEmpty = (path) => {
    return fs.readdirSync(path).length === 0;
};

/**
 * Checks which of the preconfigured package managers are available on the user machine
 * @param {string} packageManager
 * @returns {boolean}
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
 * @returns {boolean}
 */
exports.isNodeVersionSupported = () => {
    if (!ltr(version, MIN_NODE_VERSION)) return true;

    const message = `Your version of NodeJS ${version} is lower than the minimum required version (${MIN_NODE_VERSION}) to run this command. You can download the latest version of NodeJS from https://nodejs.org/en/download/`;
    console.log(boxen(chalk.redBright(message), { padding: 1 }));
    return false;
};

/**
 * Converts strings to kebab case to be used as folder names
 * @param {string} str
 * @returns {boolean}
 */
exports.convertToKebabCase = (str) => {
    //Checks if the string has numbers, capital leters, spaces etc and converts them to dashes (-)
    return str
        .match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
        .filter(Boolean)
        .map((x) => x.toLowerCase())
        .join('-');
};

/**
 * Converts strings to camel case to be used as model names
 * @param {String} str
 * @returns
 */
exports.convertToCamelCase = (str) => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index !== 0 ? word.toUpperCase() : word; //Matches the first letter in any new word or if preceeded by dash (-)
        })
        .replace(/\s+/g, ''); //Remove whitespaces
};
/**
 * Checks if project name is kebab case
 * @param {string} name
 * @returns {boolean}
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
                const components = data.results
                    .filter(({ package }) => package?.author?.name === 'CoherentLabs')
                    .reduce((acc, el) => {
                        if (el.package?.keywords?.includes('Component')) {
                            acc.push({ name: el.package.name });
                        }
                        return acc;
                    }, []);

                return Promise.resolve(components);
            })
            .then((components) => {
                spinner.stop();
                spinner.clear();
                resolve(components);
            });
    });
};

/**
 * Creates the project folder
 * @param {string} name
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
 * @param {string} folderName
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
 * @param {string} pkgMgr
 * @param {string} targetDirectory
 * @returns {Object}
 */
exports.installPackages = (pkgMgr, targetDirectory) => {
    return {
        title: `Installing packages`,
        enabled: () => true,
        task: () => {
            try {
                execa.sync(pkgMgr, ['i'], {
                    cwd: targetDirectory,
                });
            } catch (error) {
                throw new Error(error);
            }
        },
    };
};

/**
 * Creates a task for Listr
 * @param {string} title
 * @param {function} task
 * @param {function} enabled
 * @returns {Object}
 */
exports.taskGenerator = (title, task, enabled = () => true) => ({
    title,
    enabled,
    task,
});

/**
 * Reads the config from the project folder
 * @param {string} name
 * @returns
 */
exports.readConfig = (name) => {
    return fs.readFileSync(`./${name}/${CONFIG_NAME}${CONFIG_EXTENSION}`);
};

/**
 * Checks if there is a model.js file and returns it if it exists
 * @returns {Promise}
 */
exports.readModelFile = () => {
    return new Promise((resolve) => {
        try {
            const result = fs.readFileSync('./model.js').toString();
            resolve(result);
        } catch (error) {
            resolve(false);
        }
    });
};
/**
 * Creates a file with a given content
 * @param {string} name
 * @param {string} pathToFile
 * @param {string} content
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
 * @param {string} name
 * @param {string} pathToFolder
 */
exports.createFolder = (name, pathToFolder) => {
    fs.mkdirSync(`${pathToFolder}/${name}`, { recursive: true });
};

/**
 * Copies files or folders
 * @param {string} src
 * @param {string} dest
 * @returns {Promise}
 */
exports.copyData = (src, dest) => {
    return fs.copy(src, dest);
};

/**
 * Gets the style file extension based on the preprocessor
 * @param {string} preprocessor
 * @returns {string}
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
