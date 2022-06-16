const { spawn } = require('child_process');
const { cwd } = require('process');
const path = require('path');
const concat = require('concat-stream');
const { COMMAND_PATH, PACKAGE_PATH } = require('./config');
const fs = require('fs-extra');

function createCohCliProcess(
    processPath,
    args = [],
    opt = {
        cwd: cwd(),
    }
) {
    args = [processPath].concat(args);

    return spawn(path.resolve(__dirname, `${COMMAND_PATH}.cmd`), args, { cwd: opt.cwd });
}
exports.executeWithInput = (command, args = [], inputs = [], opts = {}) => {
    // Handle case if user decides not to pass input data
    // A.k.a. backwards compatibility
    if (!Array.isArray(inputs)) {
        opts = inputs;
        inputs = [];
    }

    const { timeout = 2000, cwd } = opts; //The folder check takes some time
    const process = createCohCliProcess(command, args, { cwd });
    process.stdin.setEncoding('utf-8');
    process.stdout.setEncoding('utf-8');

    process.stdout.on('data', console.log);

    let currentInputTimeout;
    // Creates a loop to feed user inputs to the child process
    // in order to get results from the tool
    // This code copied alomost 1 to 1 from the inquirer-test package
    const loop = (inputs) => {
        if (!inputs.length) {
            process.stdin.end();
            return;
        }

        currentInputTimeout = setTimeout(() => {
            process.stdin.write(inputs[0]);
            loop(inputs.slice(1));
        }, timeout);
    };
    const promise = new Promise((resolve, reject) => {
        process.stderr.once('data', (err) => {
            // If process errors out, stop all
            // the pending inputs if any
            process.stdin.end();

            if (currentInputTimeout) {
                clearTimeout(currentInputTimeout);
                inputs = [];
            }

            reject(new Error(err.toString()));
        });
        process.on('error', (err) => {
            reject(new Error(err));
        });
        // Kick off the process
        loop(inputs);

        concat((result) => {
            resolve(result.toString());
        });
    });
    return promise;
};

exports.createCohConfig = async (cwd) => {
    await fs.writeFile(
        `${cwd}/coh-config.json`,
        JSON.stringify({
            name: '',
            type: '',
            cohtmlUse: true,
            packagePath: PACKAGE_PATH,
        })
    );
};
