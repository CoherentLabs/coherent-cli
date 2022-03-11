const utils = require('./utils');
const prompt = require('./prompt');
const { CHOICES, REQUIRES_PACKAGE_MANAGER, PACKAGE_MANAGERS, PREPROCESSORS, DEFAULT_CONFIGS, TYPES } = require('./config');

/**
 * Creates the config based on user choices
 */
class CreateConfig {
    constructor({ name, type, configPath, makeNewFolder, isDefault }) {
        this.config = {
            name: name,
            type
        };
        this.externalConfigPath = configPath;
        this.makeNewFolder = makeNewFolder;
        this.isDefault = isDefault;
    }

    async externalConfigSetup() {
        const configValid = await utils.checkValidConfig(this.externalConfigPath); //Checking if it's a valid config
        if (!configValid) return;

        configValid.name = this.config.name; //Change the name of the config to match the project we are creating
        this.config = configValid;

        if (!this.config.cohtmlUse) return this.saveConfig();

        const isPackagePathCorrect = utils.checkPathCorrect(this.config.packagePath); //We need to check if the Gameface/Prysm package is correct in the provided config

        if (!isPackagePathCorrect) this.config.packagePath = await prompt.askPath();

        this.saveConfig();
    }

    async init() {
        if (!utils.isNodeVersionSupported()) return;

        let advancedChoices = []; //Used for the no-framework type project

        //If we provide an external config from the --config
        if (this.externalConfigPath) return this.externalConfigSetup();

        this.config.cohtmlUse = await prompt.confirm('Are you creating a new Gameface/Prysm project?');

        const cohtmlUse = this.config.cohtmlUse;

        if (cohtmlUse) this.config.packagePath = await prompt.askPath();

        //If we have provided the --default flag we add to the date we already default options based on the project type
        if (this.isDefault) {
            this.config = { ...this.config, ...DEFAULT_CONFIGS[this.config.type] };
            return this.saveConfig();
        }

        //If we haven't provided the config type
        if (!this.config.type) this.config.type = await prompt.askSingleChoice('What type of project do you want to set up?', TYPES);

        const baseChoices = [CHOICES.addComponents];

        const type = this.config.type;

        if (cohtmlUse) baseChoices.push(CHOICES.includeCohtml);

        if (type === 'no-framework') baseChoices.push(CHOICES.useBundler, CHOICES.addTypeScript);

        if (type === 'react') baseChoices.push(CHOICES.addRedux, CHOICES.addRouter, CHOICES.usePreprocessor);

        const choices = await prompt.askMultipleChoice('Project configurations', baseChoices);

        if (type !== 'no-framework') choices.push(CHOICES.useBundler.name);

        if (choices.includes(CHOICES.addTypeScript.name)) choices.push(CHOICES.useBundler.name);

        this.config.typescript = choices.includes(CHOICES.addTypeScript.name);
        this.config.cohtmlInclude = choices.includes(CHOICES.includeCohtml.name);
        this.config.bundler = choices.includes(CHOICES.useBundler.name);

        if (type === 'react') {
            this.config.store = choices.includes(CHOICES.addRedux.name);
            this.config.router = choices.includes(CHOICES.addRouter.name);
        }

        if (REQUIRES_PACKAGE_MANAGER.some((r) => choices.includes(r))) {
            this.config.packageManager = await prompt.askSingleChoice('Choose your package manager', PACKAGE_MANAGERS, utils.checkPackageManager);
        }

        if (choices.includes(CHOICES.useBundler.name) && this.config.type === 'no-framework') {
            advancedChoices = await prompt.askMultipleChoice('Advanced configuration', [CHOICES.usePreprocessor]);
        }

        if (advancedChoices.includes(CHOICES.usePreprocessor.name) || choices.includes(CHOICES.usePreprocessor.name)) {
            this.config.preProcessor = await prompt.askSingleChoice('Which CSS preprocessor do you want to use?', PREPROCESSORS);
        }

        if (choices.includes(CHOICES.addComponents.name)) {
            const packages = await utils.getCoherentPackages();
            this.config.components = await prompt.askMultipleChoice('Choose components to be installed:', packages);
        }

        this.saveConfig();
    }

    /**
     * Saves the config to file
     */
    saveConfig() {
        if (this.makeNewFolder) utils.createProjectFolder(this.config.name);

        utils.saveConfigToFolder(this.config.name, this.config);
    }
}

module.exports = CreateConfig;
