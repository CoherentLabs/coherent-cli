module.exports = `
import ReactDOM from 'react-dom';
import React from 'react';
<% if (router) { %>
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
<% } %>
<% if (store) { %>
import { Provider } from 'react-redux';
import store from './store';
<% } %>
import './style.<%= preprocessor %>';

<% if (cohtmlInclude) { %>
import * as engine from './cohtml.js';
<% } %>

const App = () => {
    return (
        <% if (router) { %>
        <Router>
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
        </Router>
        <% } else { %>
        <div>
            <h1>This is a React app!</h1>
        </div>
        <% } %>
    );
};
<% if (store) { %>
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);
<% } else { %>
ReactDOM.render(<App />, document.getElementById('app'));
<% } %>
`;
