const { DOCUMENT_NAMES } = require('../config');

module.exports = `
<html>
<head>
    <% if (!preprocessor) {%>
        <link rel="stylesheet" href="./${DOCUMENT_NAMES.styles}.css" />
    <% } else { %>
        <link rel="stylesheet" href="./dist/${DOCUMENT_NAMES.styles}.css" />
    <% } %>
</head>
<body>
    <% if (cohtmlInclude) { %>
        <script src="./cohtml.js"></script>
    <% } %>
    <% if (!bundler) {%>
        <script src="./${DOCUMENT_NAMES.script}.js"></script>
    <% } else { %>
        <script src="./dist/${DOCUMENT_NAMES.script}.js"></script>
    <% } %>
</body>
</html>
`;
