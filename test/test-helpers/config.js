const { packagePath } = require('./package.config.json');

module.exports = {
    COMMAND_PATH: '../../bin/run',
    COMMANDS: {
        CREATE_MOCK_MODEL: 'create-mock-model',
        LINT: 'lint',
        PLAYER: 'player',
        CREATE: 'create'
    },
    PACKAGE_PATH: packagePath,
    KEYS: {
        ENTER: '\x0D'
    }
};
