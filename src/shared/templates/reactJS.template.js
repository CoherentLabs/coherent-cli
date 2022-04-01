const ejs = require('ejs');

module.exports = ({ router, store, cohtmlInclude, preprocessor }) => {
    const routerImport = router ? "import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';" : '';

    const storeImports = store ? "import { Provider } from 'react-redux';\nimport store from './store';" : '';

    const cohtmlImport = cohtmlInclude ? "import * as engine from './cohtml.js';" : '';

    const reactCode = router
        ? `<Router>
    <div>
        <nav>
            <ul>
                <li>
                    <Link to='/'>Home</Link>
                </li>
                <li>
                    <Link to='/about'>About</Link>
                </li>
            </ul>
        </nav>

        <Routes>
            <Route path='/about' element={<h1>This is the About Page!</h1>}></Route>
            <Route path='/' element={<h1>This is the React App Home Page!</h1>}></Route>
        </Routes>
    </div>
</Router>`
        : `<div>
<h1>This is a React app!</h1>
</div>`;

    const reactRender = store
        ? `ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);`
        : `ReactDOM.render(<App />, document.getElementById('app'));`;

    return ejs.render(template, { routerImport, storeImports, cohtmlImport, reactCode, reactRender, preprocessor });
};

const template = `
import ReactDOM from 'react-dom';
import React from 'react';
<%- routerImport %>
<%- storeImports %>
import './style.<%= preprocessor %>';

<%- cohtmlImport %>

const App = () => {
    return (
        <%- reactCode %>
    );
};
<%- reactRender %>
`;
