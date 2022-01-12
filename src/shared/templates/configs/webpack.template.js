const { DOCUMENT_NAMES } = require('../../config');

module.exports = `

const path = require( 'path' );

module.exports = {
    mode: 'production',
    entry: [
        './src/<%= typescript ? 'ts' : 'js' %>/${DOCUMENT_NAMES.script}.<%= typescript ? 'ts' : 'js' %>',
        "<%- preprocessor !== 'css' ? './src/' + preprocessor + '/${DOCUMENT_NAMES.styles}.' + preprocessor : '' %>"
    ],
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: '${DOCUMENT_NAMES.script}.js',
    },
    resolve: {
        extensions: [ <%- typescript ? "'.ts'" : "" %>, '.js' ],
    },

    module: {
             rules: [
                <% if (typescript) {%>
                 {
                    test: /\.tsx?/,
                    use: 'ts-loader',
                     exclude: /node_modules/,
                 },
                <% } %>

                <% if (preprocessor) { %>
                    <% if (preprocessor === 'scss') { %>
                        {
                            test: /\.s[ac]ss$/i,
                            use: [
                                {
                                    loader: 'file-loader',
                                    options: { outputPath: './', name: '${DOCUMENT_NAMES.styles}.css' }
                                },
                                'sass-loader'
                            ]
                        },
                    <% } %>
                    <% if (preprocessor === 'less') { %>
                        {
                            test: /\.less$/i,
                            use: [
                                {
                                    loader: 'file-loader',
                                    options: { outputPath: './', name: '${DOCUMENT_NAMES.styles}.css' }
                                },
                                'less-loader'
                            ]
                        },
                    <% } %>
                    <% if (preprocessor === 'styl') { %>
                        {
                            test: /\.styl$/,
                            use: [
                                {
                                    loader: 'file-loader',
                                    options: { outputPath: './', name: '${DOCUMENT_NAMES.styles}.css' }
                                },
                                'stylus-loader'
                            ]
                        },
                    <% } %>
                <% } %>
             ]
         }

};

`;
