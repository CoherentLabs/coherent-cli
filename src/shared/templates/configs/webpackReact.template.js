const ejs = require('ejs');

module.exports = ({ preprocessor }) => {
    const preprocessorRegex = () => {
        switch (preprocessor) {
            case 'scss':
                return 's[ac]ss';
            case 'less':
                return 'less';
            case 'styl':
                return 'styl';
            default:
                return 'css';
        }
    };

    const preprocessorLoader = () => {
        switch (preprocessor) {
            case 'scss':
                return ', "sass-loader"';
            case 'less':
                return ', "less-loader"';
            case 'styl':
                return ', "stylus-loader"';
            default:
                return '';
        }
    };

    return ejs.render(template, { preprocessorLoader: preprocessorLoader(), preprocessorRegex: preprocessorRegex() });
};

const template = `
const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCSSExctractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = (env) => {
    const isProd = env === 'production';
    const entry = [path.resolve(__dirname) + '/src/index.js'];

    return {
        entry: entry,
        mode: env,
        resolve: { extensions: ['*', '.js', '.jsx'] },
        output: {
            path: path.resolve(__dirname, 'dist/'),
            publicPath: './',
            filename: 'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    options: { presets: ['@babel/env'] }
                },
                {
                    test: /\.<%= preprocessorRegex %>$/,
                    loader: [MiniCSSExctractPlugin.loader, 'css-loader' <%- preprocessorLoader %>]
                },
                {
                    test: /\.html$/,
                    use: [{ loader: 'html-loader' }]
                },
                {
                    test: /\.(jpe?g|png|gif|svg|webm|ttf|tga)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                useRelativePath: false,
                                publicPath: './'
                            }
                        }
                    ]
                }
            ]
        },
        devtool: isProd ? 'source-map' : 'inline-source-map',
        optimization: {
            minimize: isProd
        },
        plugins: [
            new HtmlWebPackPlugin({
                template: './src/index.html',
                filename: './index.html'
            }),
            new MiniCSSExctractPlugin()
        ],
        devServer: !isProd
            ? {
                  contentBase: path.join(__dirname, './src'),
                  port: 3000,
                  hot: false,
                  lazy: false,
                  inline: false,
                  compress: true,
                  publicPath: 'http://localhost:3000/'
              }
            : {}
    };
};

module.exports = config;
`;
