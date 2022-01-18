module.exports = `
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
                    test: /\.<%= preprocessor === 'scss' ? 's[ac]ss' : preprocessor === 'less' ? 'less' : preprocessor === 'styl' ? 'styl' : 'css' %>$/,
                    loader: [MiniCSSExctractPlugin.loader, 'css-loader' <%- preprocessor === 'scss' ? ", 'sass-loader'" : preprocessor === 'less' ? ", 'less-loader'" : preprocessor === 'styl' ? ", 'stylus-loader'" : '' %>]
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
            new CopyWebpackPlugin([
                {
                    from: './assets',
                    to: './assets'
                }
            ]),
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
