const { expect } = require('chai');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { COMMAND_PATH, COMMANDS } = require('../test-helpers/config');

const commandPath = path.resolve(__dirname, COMMAND_PATH);

const cwd = path.resolve(__dirname, '../test-helpers/create-mock-model/');

describe('create-mock-model', () => {
    const model1 = 'MockModel';

    it('creates model.js file', () => {
        execSync(`${commandPath} ${COMMANDS.CREATE_MOCK_MODEL} ${model1}`, { cwd });
        const fileExists = fs.existsSync(`${cwd}/model.js`);
        expect(fileExists).to.be.true;
    });

    it('model.js file contains model', () => {
        const file = fs.readFileSync(`${cwd}/model.js`).toString();
        const matchModel = file.match(model1);
        expect(matchModel).to.not.be.null;
    });

    it('adds second model to model.js', () => {
        const model2 = 'SecondMockModel';
        execSync(`${commandPath} ${COMMANDS.CREATE_MOCK_MODEL} ${model2}`, { cwd });
        const file = fs.readFileSync(`${cwd}/model.js`).toString();
        const matchModel = file.match(model2);
        expect(matchModel).to.not.be.null;
    });

    after(async () => {
        await fs.remove(`${cwd}/model.js`);
    });
});
