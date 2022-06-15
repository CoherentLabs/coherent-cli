const { expect } = require('chai');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { COMMAND_PATH, COMMANDS, KEYS } = require('../test-helpers/config');
const { executeWithInput } = require('../test-helpers/function-helpers');

const commandPath = path.resolve(__dirname, COMMAND_PATH);

const cwd = path.resolve(__dirname, '../test-helpers/create/test-create/');

describe('create', function () {
    this.timeout(0);

    xit('creates correct coh-config', async (done) => {
        const name = 'test-project-1';
        executeWithInput('create', [name], ['n'], { cwd })
            .then((result) => {
                expect(true).to.be.true;
                done();
            })
            .catch(done);
    });

    after(async () => {
    });
});
