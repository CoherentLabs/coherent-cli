const { DOCUMENT_NAMES } = require('../../config');

const ejs = require('ejs');

module.exports = ({ preprocessor, typescript }) => {
    const scriptExtension = typescript ? 'ts' : 'js';

    const scriptEntry = `./src/${scriptExtension}/${DOCUMENT_NAMES.script}.${scriptExtension}`;

    const preprocessorEntry = preprocessor !== 'css' ? `./src/${preprocessor}/${DOCUMENT_NAMES.styles}.${preprocessor}` : '';

    const typescriptExtension = typescript ? '.ts,' : '';

    const typescriptRule = () => {
        if (!typescript) return '';

        return `{
               test: /\.tsx?/,
               use: 'ts-loader',
                exclude: /node_modules/,
            },`;
    };

    const preprocessorRules = () => {
        switch (preprocessor) {
            case 'scss':
                return `{
                        test: /\.s[ac]ss$/i,
                        use: [
                            {
                                loader: 'file-loader',
                                options: { outputPath: './', name: '${DOCUMENT_NAMES.styles}.css' }
                            },
                            'sass-loader'
                        ]
                    },`;

            case 'less':
                return `{
                            test: /\.less$/i,
                            use: [
                                {
                                    loader: 'file-loader',
                                    options: { outputPath: './', name: '${DOCUMENT_NAMES.styles}.css' }
                                },
                                'less-loader'
                            ]
                        },`;
            case 'styl':
                return `{
                            test: /\.styl$/,
                            use: [
                                {
                                    loader: 'file-loader',
                                    options: { outputPath: './', name: '${DOCUMENT_NAMES.styles}.css' }
                                },
                                'stylus-loader'
                            ]
                        },`;
            default:
                return '';
        }
    };

    return ejs.render(template, { scriptEntry, preprocessorEntry, typescriptExtension, typescriptRule: typescriptRule(), preprocessorRules: preprocessorRules() });
};

const template = `

const path = require( 'path' );

module.exports = {
    mode: 'production',
    entry: [
        '<%- scriptEntry %>',
        "<%- preprocessorEntry %>"
    ],
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: '${DOCUMENT_NAMES.script}.js',
    },
    resolve: {
        extensions: [ <%- typescriptExtension %> '.js' ],
    },

    module: {
             rules: [
                <%- typescriptRule %>
                <%- preprocessorRules %>
             ]
         }

};

`;
