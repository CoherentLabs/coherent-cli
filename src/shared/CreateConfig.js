const utils = require('./utils');
const prompt = require('./prompt');
const { CHOICES, REQUIRES_PACKAGE_MANAGER, PACKAGE_MANAGERS, PREPROCESSORS, BUNDLERS, DEFAULT_CONFIGS, TYPES } = require('./config');

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

    async init() {
        if (!utils.checkNodeVersion()) return;

        let advancedChoices = [];

        if (this.externalConfigPath) {
            const configValid = await utils.checkValidConfig(this.externalConfigPath);
            if (configValid) {
                configValid.name = this.config.name;
                this.config = configValid;
                if (this.config.cohtmlUse) {
                    const isPackagePathCorrect = utils.checkPathCorrect(this.config.packagePath);

                    if (!isPackagePathCorrect) {
                        this.config.packagePath = await prompt.askPath();
                    }
                }
                this.saveConfig();
            }
            return;
        }

        this.config.cohtmlUse = await prompt.confirm('Are you creating a new Gameface/Prysm project?');

        if (this.config.cohtmlUse) {
            this.config.packagePath = await prompt.askPath();
        }

        if (this.isDefault) {
            this.config = Object.assign(this.config, DEFAULT_CONFIGS[this.type]);
            this.saveConfig();
            return;
        }

        if (!this.config.type) {
            this.config.type = await prompt.askSingleChoice('What type of project do you want to set up?', TYPES);
        }

        const baseChoices = [CHOICES.addComponents];

        if (this.config.cohtmlUse) baseChoices.push(CHOICES.includeCohtml);

        if (this.config.type === 'no-framework') baseChoices.push(CHOICES.useBundler, CHOICES.addTypeScript);

        if (this.config.type === 'react') baseChoices.push(CHOICES.addRedux, CHOICES.addRouter, CHOICES.usePreprocessor);

        const choices = await prompt.askMultipleChoice('Project configurations', baseChoices);

        if (this.config.type !== 'no-framework') choices.push(CHOICES.useBundler.name);

        if (choices.includes(CHOICES.addTypeScript.name)) choices.push(CHOICES.useBundler.name);

        this.config.typescript = choices.includes(CHOICES.addTypeScript.name);
        this.config.cohtmlInclude = choices.includes(CHOICES.includeCohtml.name);
        this.config.bundler = choices.includes(CHOICES.useBundler.name);

        if (this.config.type === 'react') {
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

    saveConfig() {
        if (this.makeNewFolder) {
            utils.createProjectFolder(this.config.name);
        }

        utils.saveConfigToFolder(this.config.name, this.config);
    }
}

module.exports = CreateConfig;
