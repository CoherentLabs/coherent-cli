module.exports = {
    webpack: {
        name: 'webpack',
        version: '4.0.0'
    },
    webpackCLI: {
        name: 'webpack-cli',
        version: '3.0.8'
    },
    typescript: [
        {
            name: 'typescript',
            version: '4.5.4'
        },
        {
            name: 'ts-loader',
            version: '8.3.0'
        }
    ],
    preprocessors: {
        fileLoader: {
            name: 'file-loader',
            version: '6.2.0'
        },
        scss: [
            {
                name: 'sass',
                version: '1.47.0'
            },
            {
                name: 'sass-loader',
                version: '10.2.0'
            }
        ],
        less: [
            {
                name: 'less',
                version: '4.1.2'
            },
            {
                name: 'less-loader',
                version: '7.3.0'
            }
        ],
        styl: [
            {
                name: 'stylus',
                version: '0.56.0'
            },
            {
                name: 'stylus-loader',
                version: '4.3.3'
            }
        ]
    }
};
