const { installPackages, getStyleExtension } = require('../../utils');
const packages = require('./packages');

class PackageJSONManager {
    constructor(config) {
        this.package = {
            name: config.name,
            version: '1.0.0',
            description: '',
            scripts: {},
            devDependencies: {},
            dependencies: {},
            keywords: [],
            author: '',
            license: 'ISC'
        };
        this.config = config;
    }

    installPackagesTask() {
        return installPackages(this.config.packageManager, `./${this.package.name}/`);
    }

    createPackageJSON() {
        this.package.devDependencies[packages.webpack.name] = `^${packages.webpack.version}`;
        this.package.devDependencies[packages.webpackCLI.name] = `^${packages.webpackCLI.version}`;

        if (this.config.typescript) {
            packages.typescript.forEach((dependency) => {
                this.package.devDependencies[dependency.name] = `^${dependency.version}`;
            });
        }

        if (this.config.preProcessor) {
            if (this.config.type !== 'react') this.package.devDependencies[packages.fileLoader.name] = `^${packages.fileLoader.version}`;

            const preprocessorPackages = packages.preprocessors[getStyleExtension(this.config.preProcessor)];

            preprocessorPackages.forEach((dependency) => {
                this.package.devDependencies[dependency.name] = `^${dependency.version}`;
            });
        }

        if (this.config.components?.length > 0) {
            this.config.components.forEach((dependency) => {
                this.package.dependencies[dependency] = `^1.0.0`;
            });
        }

        if (this.config.type === 'no-framework') this.package.scripts.build = 'webpack';

        if (this.config.type === 'react') {
            this.package.scripts.build = 'webpack --env production';
            this.package.scripts.start = 'webpack-dev-server --env development';

            this.package.devDependencies[packages.fileLoader.name] = `^${packages.fileLoader.version}`;

            packages.react.forEach((dependency) => {
                this.package.dependencies[dependency.name] = `^${dependency.version}`;
            });

            packages.reactDev.forEach((dependency) => {
                this.package.devDependencies[dependency.name] = `^${dependency.version}`;
            });

            packages.babel.forEach((dependency) => {
                this.package.devDependencies[dependency.name] = `^${dependency.version}`;
            });
        }

        if (this.config.router) {
            this.package.dependencies[packages.router.name] = `^${packages.router.version}`;
        }

        if (this.config.store) {
            packages.store.forEach((dependency) => {
                this.package.dependencies[dependency.name] = `^${dependency.version}`;
            });
        }

        return JSON.stringify(this.package);
    }
}

module.exports = PackageJSONManager;
