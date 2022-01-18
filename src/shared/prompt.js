const inquirer = require('inquirer');
inquirer.prompt.registerPrompt('path', require('inquirer-path').PathPrompt);

const utils = require('./utils');

const ora = require('ora');

/**
 * Prompts an open answer question
 * @param {String} question Question to ask
 * @param {String} defaultValue The default value of the question
 * @param {Function} validation Function to validate the answer
 * @returns {String}
 */
exports.askQuestion = async (question, defaultValue = '', validation = (answer) => answer !== '') => {
    const answer = await inquirer.prompt([
        {
            name: 'question',
            type: 'input',
            default: defaultValue,
            validate: validation,
            message: question
        }
    ]);

    return answer.question;
};

/**
 * Asks a yes or no question
 * @param {String} message
 * @param {Boolean} defaultValue
 * @returns {Boolean}
 */
exports.confirm = async (message, defaultValue = true) => {
    const { confirmation } = await inquirer.prompt([
        {
            name: 'confirmation',
            type: 'confirm',
            default: defaultValue,
            message
        }
    ]);

    return confirmation;
};

/**
 * Asks for a path to the Gameface/Prysm package
 * @returns {String}
 */
exports.askPath = async () => {
    const { resolved } = await inquirer.prompt([
        {
            name: 'resolved',
            type: 'path',
            validate: utils.checkPathCorrect,
            message: 'Add the path to your Gameface/Prysm package',
            directoryOnly: true
        }
    ]);

    return resolved;
};

/**
 * Asks a multiple choice question
 * @param {String} message
 * @param {Array} choices
 * @returns {Array}
 */
exports.askMultipleChoice = async (message, choices) => {
    const { selection } = await inquirer.prompt([
        {
            type: 'checkbox',
            message,
            name: 'selection',
            choices
        }
    ]);

    return selection;
};

/**
 * Asks single choice question
 * @param {String} message
 * @param {Array} choices
 * @returns {String}
 */
exports.askSingleChoice = async (message, choices) => {
    const spinner = ora('Loading options...').start();
    choices = choices.filter(validation);
    spinner.stop();
    const { choice } = await inquirer.prompt([
        {
            name: 'choice',
            type: 'list',
            message,
            choices
        }
    ]);

    return choice;
};
