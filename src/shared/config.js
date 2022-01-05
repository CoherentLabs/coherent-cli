module.exports = {
    CONFIG_NAME: 'coh-config',
    CONFIG_EXTENSION: '.json',
    MIN_NODE_VERSION: '14.14.0',
    CHOICES: {
        addFilesTo: {
            name: 'Add script and style files to html',
            checked: true,
            requiresPackageManager: false
        },
        addComponents: {
            name: 'Add components',
            requiresPackageManager: true
        },
        includeCohtml: { name: 'Include cohtml', checked: true, requiresPackageManager: false },
        addLinters: { name: 'Add Linters', requiresPackageManager: true },
        useBundler: { name: 'Use bundler(webpack, rollup, vite)', requiresPackageManager: true },
        useCompiler: { name: 'Use JS Compiler(Babel)', requiresPackageManager: true },
        usePreprocessor: { name: 'Use CSS Preprocessor(SCSS/SASS, LESS', requiresPackageManager: true },
        addRedux: { name: 'Add React Redux', requiresPackageManager: true },
        addRouter: { name: 'Add React Router', requiresPackageManager: true },
        addTypeScript: { name: 'Add Typescript', requiresPackageManager: true }
    },
    DEFAULT_CONFIGS: {
        vanilla: {cohtmlUse: true},
        react: {cohtmlUse: true},
        preact: {cohtmlUse: true}
    },
    TYPES: ['vanilla', 'react', 'preact'],
    BUNDLERS: ['Webpack', 'Rollup', 'Parcel', 'Vite'],
    PREPROCESSORS: ['scss/sass', 'less', 'stylus'],
    PACKAGE_MANAGERS: ['npm', 'yarn', 'pnpm'],
    get REQUIRES_PACKAGE_MANAGER() {
        return Object.values(this.CHOICES)
            .filter((r) => r.requiresPackageManager)
            .map((r) => r.name);
    }
};
