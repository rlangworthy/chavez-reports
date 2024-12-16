import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Router } from 'react-router-dom';
import { history } from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

console.log('puburl : ' + process.env.PUBLIC_URL)
ReactDOM.render(
    <Router history={history} basename={process.env.PUBLIC_URL}>
        <GoogleOAuthProvider clientId="126149146398-0q04pjbq98bov64tsgbgs5mlqmnmj540.apps.googleusercontent.com">
            <App />
        </GoogleOAuthProvider>
    </Router>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
