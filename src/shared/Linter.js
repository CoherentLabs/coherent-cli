const { checkValidConfig, checkPathCorrect } = require('./utils');
const fs = require('fs-extra');
const { cwd } = require('process');
const chalk = require('chalk');
const path = require('path');
const { execSync } = require('child_process');
const chokidar = require('chokidar');
const execa = require('execa');

class Linter {
    constructor(type) {
        this.type = type;
    }

    lint(file) {
        if (this.isPackagePathCorrect) { //Failsafe if lint runs before init or init hasn't thrown an error but there is no config
            switch (this.type) {
                case 'css':
                    this.lintCSS(file);
                    break;
                case 'html':
                    this.lintHTML(file);
                    break;
                default:
                    break;
            }
        }
    }

    async init() {
        this.config = await checkValidConfig('./coh-config.json'); //Checking if it's a valid config or if it exists in the folder
        if (this.config?.packagePath) {
            this.isPackagePathCorrect = checkPathCorrect(this.config.packagePath); //We need to check if the Gameface/Prysm package is correct in the config

            if (this.isPackagePathCorrect) {
                if (this.type === 'html') this.initHTML();
                else await this.initCSS();
            }
        }
    }

    /**
     * The stylelint config doesn't work without dependencies, so instead of having people install them, we check and then install
     */
    async initCSS() {
        const exists = await fs.pathExists(`${this.config.packagePath}/Samples/uiresources/library/CSSLint/node_modules`);

        if (!exists) {
            try {
                execa.sync('npm', ['i'], {
                    cwd: `${this.config.packagePath}/Samples/uiresources/library/CSSLint/`
                });
            } catch (error) {
                throw new Error(error);
            }
        }
    }

    /**
     * 
     * Building the command flags
     */
    initHTML() {
        const contructRulesOption = (rules) => {
            let rulesOption = [];
            const rulesNames = Object.keys(rules);

            for (let ruleName of rulesNames) {
                const ruleValue = rules[ruleName];

                if (ruleValue == true) {
                    rulesOption.push(`${ruleName}`);
                } else if (ruleValue !== false) {
                    rulesOption.push(`${ruleName}=${ruleValue}`);
                }
            }

            return rulesOption.join(',');
        };
        this.IGNORED = ['node_modules/**/*.html', 'scripts/**/*.html', '.cohtmllintrc', 'package-lock.json', 'package.json', 'rules/**/*.html', 'tests/**/*.html'];
        this.configObject = fs.readFileSync(`${this.config.packagePath}/Samples/uiresources/library/HTMLLint/.cohtmllintrc`);

        try {
            this.configObject = JSON.parse(this.configObject);
        } catch (error) {
            console.error(error);
        }

        if (!this.configObject) return;

        this.htmlRules = contructRulesOption(this.configObject.html);
        this.cohtmlRules = contructRulesOption(this.configObject.cohtml);
    }

    lintCSS(file = '**/*.css') {
        const configDir = path.relative(cwd(), `${this.config.packagePath}/Samples/uiresources/library/CSSLint/.stylelintrc.json`).replaceAll('/', '\\');
        try {
            const result = execSync(`npx stylelint "${file}" --config "${configDir}"`, {
                encoding: 'utf8'
            });
            console.log(chalk.greenBright(result));
        } catch (error) {
            console.error(error.stdout);
        }
    }

    lintHTML(file = '**/*.html') {
        const rulesDir = `${this.config.packagePath}/Samples/uiresources/library/HTMLLint/rules/`.replaceAll('\\', '/');
        try {
            const result = execSync(`npx htmlhint ${file} --ignore ${this.IGNORED.join(',')} --rulesdir ${rulesDir} --rules ${this.htmlRules}${this.cohtmlRules}`, {
                encoding: 'utf8'
            });
            console.log(chalk.greenBright(result));
        } catch (error) {
            console.error(error.stdout);
        }
    }

    watch() {
        if (this.isPackagePathCorrect) {
            const watcher = chokidar.watch(cwd(), {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true
            });

            watcher.on('change', (file) => {
                if (file.indexOf(`.${this.type}`) > -1) this.lint(file);
            });
        }
    }
}

module.exports = Linter;
