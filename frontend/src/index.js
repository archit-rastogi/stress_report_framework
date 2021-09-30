import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import NavHeader from './components/UI/NavHeader';

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <NavHeader>
                <App/>
            </NavHeader>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);
