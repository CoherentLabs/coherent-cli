module.exports = {
    index: `
    import { createStore } from 'redux';
    import reducer from './reducers';
    
    export default createStore(reducer);
    `,
    reducers: `
    export default (state, action) => {
        switch (action.type) {
            default:
                return state;
        }
    };
    `,
    actions: ``
};
