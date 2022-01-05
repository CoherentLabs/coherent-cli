const inquirer = require('inquirer');
inquirer.prompt.registerPrompt('path', require('inquirer-path').PathPrompt);

const utils = require('./utils');

const ora = require('ora');

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

exports.askSingleChoice = async (message, choices, validation = () => true) => {
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
