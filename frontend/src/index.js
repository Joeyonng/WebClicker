import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {BrowserRouter, Route} from "react-router-dom";

import {store} from './redux'

import Router from './components/Router';
import {initFirebase} from "./firebaseApi";

initFirebase();

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Route path='/:user?' component={Router}/>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);


