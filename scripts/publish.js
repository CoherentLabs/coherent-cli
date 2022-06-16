const path = require('path');
const { execSync } = require('child_process');
const packageJSON = require('../package.json');
const CLI_PATH = path.join(__dirname, '../');

/**
 * Gets the latest version of some npm package
 * @param {string} npmPackage - The npm package name
 * @returns {string}
 */
function getPublicVersion(npmPackage) {
    return execSync(`npm view ${npmPackage} version`, { encoding: 'utf8' }).replace('\n', '');
}

/**
 * Checks if some component should be updated in npm if its version is bumped
 * @param {string} component
 * @param {string} folder
 * @returns {boolean}
 */
function shouldUpdate() {
    if (!packageJSON) return false;

    const { name } = packageJSON;

    // if a component doesn't exist in the registry then it must be published
    if (!JSON.parse(execSync(`npm search ${name} --json`, { encoding: 'utf8' })).length) return true;

    const localVersion = packageJSON.version;
    const publicVersion = getPublicVersion(name);

    if (localVersion !== publicVersion) {
        console.log(`Package coherent-cli has new version - ${localVersion}, current is ${publicVersion}.`);
        return true;
    }

    return false;
}

/**
 * Will publish component changes in npm
 * @param {string} component
 * @param {string} folder
 */
function publish() {
    try {
        execSync(`npm publish`, { cwd: CLI_PATH, encoding: 'utf8' });
        console.log(`Successfully published coherent-cli.`);
    } catch (err) {
        console.error(err);
    }
}

/** */
function main() {
    if (shouldUpdate()) publish();
}

main();
