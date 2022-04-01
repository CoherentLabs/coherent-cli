module.exports = {
    webpack: {
        name: 'webpack',
        version: '4.46.0'
    },
    webpackCLI: {
        name: 'webpack-cli',
        version: '3.3.12'
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
    fileLoader: {
        name: 'file-loader',
        version: '6.2.0'
    },
    preprocessors: {
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
    },
    babel: [
        {
            name: '@babel/cli',
            version: '7.13.0'
        },
        {
            name: '@babel/core',
            version: '7.13.8'
        },
        {
            name: '@babel/preset-env',
            version: '7.13.8'
        },
        {
            name: '@babel/preset-react',
            version: '7.12.13'
        },
        {
            name: 'babel-loader',
            version: '8.2.2'
        }
    ],
    reactDev: [
        {
            name: 'copy-webpack-plugin',
            version: '5.1.2'
        },
        {
            name: 'css-loader',
            version: '1.0.1'
        },
        {
            name: 'html-loader',
            version: '0.5.5'
        },
        {
            name: 'html-webpack-plugin',
            version: '3.2.0'
        },
        {
            name: 'mini-css-extract-plugin',
            version: '0.4.5'
        },
        {
            name: 'style-loader',
            version: '2.0.0'
        },
        {
            name: 'webpack-dev-server',
            version: '3.11.0'
        }
    ],
    react: [
        {
            name: 'react',
            version: '17.0.2'
        },
        {
            name: 'react-dom',
            version: '17.0.2'
        }
    ],
    router: {
        name: 'react-router-dom',
        version: '6.2.1'
    },
    store: [
        {
            name: 'react-redux',
            version: '7.2.6'
        },
        {
            name: 'redux',
            version: '4.1.2'
        }
    ]
};
