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

        if (this.config.typescript)
            packages.typescript.forEach((p) => {
                this.package.devDependencies[p.name] = `^${p.version}`;
            });

        if (this.config.preProcessor) {
            if (this.config.type !== 'react') this.package.devDependencies[packages.fileLoader.name] = `^${packages.fileLoader.version}`;

            packages.preprocessors[getStyleExtension(this.config.preProcessor)].forEach((p) => {
                this.package.devDependencies[p.name] = `^${p.version}`;
            });
        }

        if (this.config.components?.length > 0) {
            this.config.components.forEach((p) => {
                this.package.dependencies[p] = `^1.0.0`;
            });
        }

        if (this.config.type === 'no-framework') this.package.scripts.build = 'webpack';

        if (this.config.type === 'react') {
            this.package.scripts.build = 'webpack --env production';
            this.package.scripts.start = 'webpack-dev-server --env development';

            this.package.devDependencies[packages.fileLoader.name] = `^${packages.fileLoader.version}`;

            packages.react.forEach((p) => {
                this.package.dependencies[p.name] = `^${p.version}`;
            });

            packages.reactDev.forEach((p) => {
                this.package.devDependencies[p.name] = `^${p.version}`;
            });

            packages.babel.forEach((p) => {
                this.package.devDependencies[p.name] = `^${p.version}`;
            });
        }

        if (this.config.router) {
            this.package.dependencies[packages.router.name] = `^${packages.router.version}`;
        }

        if (this.config.store) {
            packages.store.forEach((p) => {
                this.package.dependencies[p.name] = `^${p.version}`;
            });
        }

        return JSON.stringify(this.package);
    }
}

module.exports = PackageJSONManager;
