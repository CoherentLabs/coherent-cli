const { installPackages, getStyleExtension } = require('../../utils');
const packages = require('./packages');

class PackageJSONManager {
    constructor(name, preprocessor, typescript, packageManager, components) {
        this.package = {
            name,
            version: '1.0.0',
            description: '',
            scripts: {
                build: 'webpack'
            },
            devDependencies: {},
            keywords: [],
            author: '',
            license: 'ISC'
        };
        this.packageManager = packageManager;
        this.typescript = typescript;
        this.preprocessor = preprocessor;
        this.components = components;
    }

    installPackagesTask() {
        return installPackages(this.packageManager, `./${this.package.name}/`);
    }

    createPackageJSON() {
        this.package.devDependencies[packages.webpack.name] = `^${packages.webpack.version}`;
        this.package.devDependencies[packages.webpackCLI.name] = `^${packages.webpackCLI.version}`;

        if (this.typescript)
            packages.typescript.forEach((p) => {
                this.package.devDependencies[p.name] = `^${p.version}`;
            });

        if (this.preprocessor) {
            this.package.devDependencies[packages.preprocessors.fileLoader.name] = `^${packages.preprocessors.fileLoader.version}`;

            packages.preprocessors[getStyleExtension(this.preprocessor)].forEach((p) => {
                this.package.devDependencies[p.name] = `^${p.version}`;
            });
        }

        if (this.components?.length > 0) {
            this.components.forEach((p) => {
                this.package.devDependencies[p] = `^1.0.0`;
            });
        }

        return JSON.stringify(this.package);
    }
}

module.exports = PackageJSONManager;
