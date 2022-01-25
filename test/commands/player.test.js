const { expect } = require('chai');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { COMMAND_PATH, COMMANDS, PACKAGE_PATH } = require('../test-helpers/config');

const commandPath = path.resolve(__dirname, COMMAND_PATH);

const cwd = path.resolve(__dirname, '../test-helpers/player/');

describe('player', () => {
    before(async () => {
        await fs.writeFile(
            `${cwd}/coh-config.json`,
            JSON.stringify({
                name: '',
                type: '',
                cohtmlUse: true,
                packagePath: PACKAGE_PATH
            })
        );
    });

    it('logs error if no flags or arguments are present', () => {
        const err = 'If you want to open a file you need to pass the path to it otherwise you can update the package in the config using the --update flag';

        let result = '';

        try {
            result = execSync(`${commandPath} ${COMMANDS.PLAYER}`, { cwd, stdio: 'pipe' });
        } catch (error) {
            result = error.stderr;
        }

        const resultMatch = result.toString().match(err);

        expect(resultMatch).to.not.be.null;
    });

    it('logs error if URL not correct format', () => {
        const err = 'You need to pass a valid file or URL';

        let result = '';

        try {
            result = execSync(`${commandPath} ${COMMANDS.PLAYER} www.google.com`, { cwd, stdio: 'pipe' });
        } catch (error) {
            result = error.stderr;
        }

        const resultMatch = result.toString().match(err);

        expect(resultMatch).to.not.be.null;
    });

    it('logs error if not file', () => {
        const err = 'You need to pass a file not directory';

        let result = '';

        try {
            result = execSync(`${commandPath} ${COMMANDS.PLAYER} test-folder`, { cwd, stdio: 'pipe' });
        } catch (error) {
            result = error.stderr;
        }

        const resultMatch = result.toString().match(err);

        expect(resultMatch).to.not.be.null;
    });

    it('logs error if not html', () => {
        const err = 'You need to pass a html file to the Player';

        let result = '';

        try {
            result = execSync(`${commandPath} ${COMMANDS.PLAYER} test.js`, { cwd, stdio: 'pipe' });
        } catch (error) {
            result = error.stderr;
        }

        const resultMatch = result.toString().match(err);

        expect(resultMatch).to.not.be.null;
    });

    after(async () => {
        await fs.remove(`${cwd}/coh-config.json`);
    });
});
