const { Command } = require('@oclif/command');
const { isValidConfig, createFile, convertToCamelCase, readModelFile, isNodeVersionSupported } = require('../shared/utils');
const ejs = require('ejs');
const { model } = require('../shared/templates');
const { CONFIG_NAME, CONFIG_EXTENSION } = require('../shared/config');

class CreateMockModelCommand extends Command {
    static args = [
        {
            name: 'modelName',
            required: true,
            description: 'the name of the model you want to create',
        },
    ];

    async run() {
        const { args } = this.parse(CreateMockModelCommand);

        if (!isNodeVersionSupported()) return;

        const configPath = `./${CONFIG_NAME}${CONFIG_EXTENSION}`;
        const configValid = await isValidConfig(configPath); //Checking if it's a valid config

        if (configValid?.cohtmlUse) {
            const modelName = convertToCamelCase(args.modelName);

            let fileData = ejs.render(model, { model: modelName });

            const modelFile = await readModelFile();

            if (!modelFile) return;

            if (modelFile.match(`engine.createJSModel\\("${modelName}"`)) return console.log(`There is already model called ${args.modelName}. Select another name`);

            fileData = modelFile.replace(/(engine.createJSModel)/, `\n    engine.createJSModel("${modelName}", {});\n\n    $1`);

            createFile(`model.js`, '.', fileData);
        }
    }
}

CreateMockModelCommand.description = `Creates mock models, to include in your project
`;

CreateMockModelCommand.flags = {};

module.exports = CreateMockModelCommand;
