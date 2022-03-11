const { html, config, react, store } = require('./templates');
const { DOCUMENT_NAMES } = require('./config');
const ejs = require('ejs');

const PackageJSONManager = require('./templates/packages/PackageJSONManager');
const { getStyleExtension, createFile, createFolder, taskGenerator, copyData } = require('./utils');

class TaskList {
    constructor(config) {
        this.packageJSONManager = new PackageJSONManager(config);
        this.config = config;
        this.taskList = [];
    }

    addTask(name, task) {
        this.taskList.push(taskGenerator(name, task));
    }

    createHTML() {
        return () =>
            createFile(
                'index.html',
                `./${this.config.name}/${this.config.type !== 'no-framework' ? 'src' : ''}`,
                ejs.render(html, { bundler: this.config.bundler, preprocessor: this.config.preProcessor, cohtmlInclude: this.config.cohtmlInclude, type: this.config.type })
            );
    }

    createStyle() {
        const stylePath = this.config.preProcessor ? `src/${getStyleExtension(this.config.preProcessor)}/` : this.config.type !== 'no-framework' ? 'src' : '';
        return () => createFile(`${DOCUMENT_NAMES.styles}.${getStyleExtension(this.config.preProcessor)}`, `./${this.config.name}/${stylePath}`, '');
    }

    createScript() {
        const scriptExtension = this.config.typescript ? 'ts' : 'js';
        const scriptPath = this.config.bundler ? `src/${scriptExtension}/` : '';

        return () => createFile(`${DOCUMENT_NAMES.script}.${scriptExtension}`, `./${this.config.name}/${scriptPath}`, '');
    }

    createReactScript(scriptExtension) {
        return () =>
            createFile(
                `${DOCUMENT_NAMES.script}.${scriptExtension}`,
                `./${this.config.name}/src`,
                ejs.render(react, {
                    cohtmlInclude: this.config.cohtmlInclude,
                    preprocessor: getStyleExtension(this.config.preProcessor),
                    router: this.config.router,
                    store: this.config.store
                })
            );
    }

    createPackageJSON() {
        return () => createFile('package.json', `./${this.config.name}/`, this.packageJSONManager.createPackageJSON());
    }

    createBabelrc() {
        return () => createFile('.babelrc', `./${this.config.name}/`, ejs.render(config.babel));
    }

    createAssetsFolder() {
        return () => createFolder('assets', `./${this.config.name}`);
    }

    createTSConfig() {
        return () => createFile('tsconfig.json', `./${this.config.name}/`, ejs.render(config.tsconfig));
    }

    createWebpack() {
        return () =>
            createFile(
                'webpack.config.js',
                `./${this.config.name}/`,
                ejs.render(config.webpack, { preprocessor: getStyleExtension(this.config.preProcessor), typescript: this.config.typescript })
            );
    }

    createReactWebpack() {
        return () =>
            createFile(
                'webpack.config.js',
                `./${this.config.name}/`,
                ejs.render(config.webpackReact, { preprocessor: getStyleExtension(this.config.preProcessor), typescript: this.config.typescript })
            );
    }

    createStore(scriptExtension) {
        return () => {
            Object.entries(store).forEach(([key, value]) => {
                createFile(`${key}.${scriptExtension}`, `./${this.config.name}/src/store`, value);
            });
        };
    }

    copyCohtml() {
        return () => copyData(`${this.config.packagePath}/Samples/uiresources/library/cohtml.js`, `./${this.config.name}/cohtml.js`);
    }

    createNoFramework() {
        this.addTask('Create index.html', this.createHTML());
        this.addTask('Create style', this.createStyle());
        this.addTask('Create script', this.createScript());

        if (this.config.cohtmlUse) this.addTask('Copy cohtml.js', this.copyCohtml());
        if (this.config.packageManager) {
            this.addTask('Create package.json', this.createPackageJSON());
            this.taskList.push(this.packageJSONManager.installPackagesTask());
        }
        if (this.config.bundler) this.addTask('Create webpack config', this.createWebpack());
        if (this.config.typescript) this.addTask('Create tsconfig.json', this.createTSConfig());
    }

    createReact() {
        const scriptExtension = this.config.typescript ? 'tsx' : 'js';

        this.addTask('Create index.html', this.createHTML());
        this.addTask('Create style', this.createStyle());
        this.addTask('Create script', this.createReactScript(scriptExtension));
        this.addTask('Create webpack', this.createReactWebpack());
        this.addTask('Create babel.rc', this.createBabelrc());
        this.addTask('Create assets folder', this.createAssetsFolder());
        this.addTask('Create package.json', this.createPackageJSON());
        this.taskList.push(this.packageJSONManager.installPackagesTask());
        if (this.config.store) this.addTask('Creating store', this.createStore(scriptExtension));
        if (this.config.cohtmlUse) this.addTask('Copy cohtml.js', this.copyCohtml());
        if (this.config.typescript) this.addTask('Creating tsconfig.json', this.createTSConfig());
    }
}

module.exports = TaskList;
