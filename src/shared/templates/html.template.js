const { DOCUMENT_NAMES } = require('../config');
const ejs = require('ejs');

module.exports = ({ type, preprocessor, bundler, cohtmlInclude }) => {
    const getStyleTag = () => {
        if (type !== 'no-framework') return '';
        return `<link rel="stylesheet" href="./${preprocessor ? 'dist/' : ''}${DOCUMENT_NAMES.styles}.css" />`;
    };

    const react = type === 'react' ? '<div id="app"></div>' : '';

    const getScriptTags = () => {
        if (type !== 'no-framework') return '';

        const tags = [];

        if (cohtmlInclude) tags.push('<script src="./cohtml.js"></script>');

        tags.push(`<script src="./${bundler ? 'dist/' : ''}${DOCUMENT_NAMES.script}.js"></script>`);

        return tags.join('\n');
    };

    return ejs.render(template, { styleTag: getStyleTag(), react, scriptTags: getScriptTags() });
};

const template = `
<html>
<head>
    <%- styleTag %>
</head>
<body>
    <%- react %>
    <%- scriptTags %>
</body>
</html>
`;
