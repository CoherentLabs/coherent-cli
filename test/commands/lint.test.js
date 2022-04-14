const { expect } = require('chai');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { COMMAND_PATH, COMMANDS } = require('../test-helpers/config');
const { createCohConfig } = require('../test-helpers/function-helpers');

const commandPath = path.resolve(__dirname, COMMAND_PATH);

const cwd = path.resolve(__dirname, '../test-helpers/lint/');

describe('lint', () => {
    before(async () => {
        await createCohConfig(cwd);
    });

    it('lints html with custom rules', () => {
        const errorString = 'data-bind-for must include an iterator and the'; //had to shorten it as the error is thrown with a new line symbol and »

        let result = '';

        try {
            result = execSync(`${commandPath} ${COMMANDS.LINT} html`, { cwd, stdio: 'pipe' });
        } catch (error) {
            result = error.stderr;
        }

        const resultMatch = result.toString().match(errorString);

        expect(resultMatch).to.not.be.null;
    });

    it('lints css with custom rules', () => {
        const errorString = 'not supported and only HEX, rgb/a and most color code names are supported.';

        let result = '';

        try {
            result = execSync(`${commandPath} ${COMMANDS.LINT} css`, { cwd, stdio: 'pipe' });
        } catch (error) {
            result = error.stderr;
        }

        const resultMatch = result.toString().match(errorString);

        expect(resultMatch).to.not.be.null;
    });

    after(async () => {
        await fs.remove(`${cwd}/coh-config.json`);
    });
});
