const { readConfig } = require('./utils');
const Listr = require('listr');
const TaskList = require('./TaskList');
/**
 * Creates a boilerplate from the config
 */
class Creator {
    constructor(name) {
        this.config = JSON.parse(readConfig(name));
    }

    /**
     * Chooses which boilerplate to create based on the type of project
     * @returns {Promise}
     */
    create() {
        const taskList = new TaskList(this.config);
        switch (this.config.type) {
            case 'no-framework':
                taskList.createNoFramework();
                break;

            case 'react':
                taskList.createReact();
                break;
            default:
                break;
        }

        const tasks = new Listr(taskList.taskList);

        return tasks.run();
    }
}

module.exports = Creator;
