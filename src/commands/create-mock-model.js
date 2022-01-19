const { Command, flags } = require('@oclif/command');
const { checkValidConfig, createFile, convertToCamelCase, saveConfigToFolder } = require('../shared/utils');
const ejs = require('ejs');
const { model } = require('../shared/templates');
const { CONFIG_NAME, CONFIG_EXTENSION } = require('../shared/config');

class CreateMockModelCommand extends Command {
    static args = [
        {
            name: 'modelName',
            required: true,
            description: 'the name of the model you want to create'
        }
    ];

    async run() {
        const { args } = this.parse(CreateMockModelCommand);

        const configPath = `./${CONFIG_NAME}${CONFIG_EXTENSION}`;
        const configValid = await checkValidConfig(configPath); //Checking if it's a valid config

        if (configValid?.cohtmlUse) {
            const modelName = convertToCamelCase(args.modelName);

            if (!configValid.mockedModels) configValid.mockedModels = [];
            
            if (configValid.mockedModels.includes(modelName)) {
                console.log(`There is already model called ${args.modelName}. Select another name`);
                return;
            }
            
            
            configValid.mockedModels.push(modelName);

            createFile(`model.js`, '.', ejs.render(model, { models: configValid.mockedModels }));
            saveConfigToFolder('', configValid);
        }
    }
}

CreateMockModelCommand.description = `Creates mock models, to include in your project
`;

CreateMockModelCommand.flags = {};

module.exports = CreateMockModelCommand;
