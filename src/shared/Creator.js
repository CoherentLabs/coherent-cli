const { readConfig, taskGenerator, createFile, copyData, getStyleExtension } = require('./utils');
const ejs = require('ejs');
const Listr = require('listr');
const { DOCUMENT_NAMES } = require('./config');
const PackageJSONManager = require('./templates/packages/PackageJSONManager');

class Creator {
    constructor(name) {
        this.config = JSON.parse(readConfig(name));
    }

    async create() {
        switch (this.config.type) {
            case 'no-framework':
                return this.createNoFramework();

            case 'react':
                return this.createReact();

            case 'preact':
                return this.createPreact();

            default:
                break;
        }
    }

    createNoFramework() {
        const { html, config } = require('./templates');

        const scriptExtenstion = this.config.typescript ? 'ts' : 'js';

        const stylePath = this.config.preProcessor ? `src/${getStyleExtension(this.config.preProcessor)}/` : '';
        const scriptPath = this.config.bundler ? `src/${scriptExtenstion}/` : '';

        const taskList = [
            taskGenerator('Creating index.html', () => {
                createFile(
                    'index.html',
                    `./${this.config.name}/`,
                    ejs.render(html, { bundler: this.config.bundler, preprocessor: this.config.preProcessor, cohtmlInclude: this.config.cohtmlInclude })
                );
            }),
            taskGenerator('Creating style.css', () => {
                createFile(`${DOCUMENT_NAMES.styles}.${getStyleExtension(this.config.preProcessor)}`, `./${this.config.name}/${stylePath}`, '');
            }),
            taskGenerator('Creating script.js', () => {
                createFile(`${DOCUMENT_NAMES.script}.${scriptExtenstion}`, `./${this.config.name}/${scriptPath}`, '');
            })
        ];

        if (this.config.cohtmlInclude)
            taskList.push(
                taskGenerator('Copying cohtml.js', () => {
                    copyData(`${this.config.packagePath}/Samples/uiresources/library/cohtml.js`, `./${this.config.name}/cohtml.js`);
                })
            );

        if (this.config.packageManager) {
            const packageJSONManager = new PackageJSONManager(this.config.name, this.config.preProcessor, this.config.typescript, this.config.packageManager, this.config.components);

            taskList.push(
                taskGenerator('Creating package.json', () => {
                    createFile('package.json', `./${this.config.name}/`, packageJSONManager.createPackageJSON());
                }),
                packageJSONManager.installPackagesTask()
            );
        }

        if (this.config.bundler) {
            taskList.push(
                taskGenerator('Creating webpack config', () => {
                    createFile(
                        'webpack.config.js',
                        `./${this.config.name}/`,
                        ejs.render(config.webpack, { preprocessor: getStyleExtension(this.config.preProcessor), typescript: this.config.typescript })
                    );
                })
            );
        }

        if (this.config.typescript) {
            taskList.push(
                taskGenerator('Creating tsconfig.json', () => {
                    createFile('tsconfig.json', `./${this.config.name}/`, ejs.render(config.tsconfig));
                })
            );
        }

        const tasks = new Listr(taskList);

        return tasks.run();
    }

    createReact() {}

    createPreact() {}
}

module.exports = Creator;
