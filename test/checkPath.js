const { askPath } = require('../src/shared/prompt');
const { isPathCorrect } = require('../src/shared/utils');
const { packagePath } = require('./test-helpers/package.config.json');

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

(async () => {
    if (packagePath.length > 0) {
        const checkPath = isPathCorrect(packagePath);

        if (checkPath === true) return;
    }

    console.log(chalk.redBright('The provided directory in the config is either empty or incorrect'));

    const newPackagePath = await askPath();

    fs.writeFileSync(path.resolve(__dirname, './test-helpers/package.config.json'), JSON.stringify({ packagePath: newPackagePath }));
})();
