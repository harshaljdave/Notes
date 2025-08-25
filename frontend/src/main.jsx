import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Set the base URL for Axios
if (import.meta.env.PROD) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
} else {
  axios.defaults.baseURL = 'http://127.0.0.1:8000';
}

axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
axios.defaults.xsrfCookieName = 'csrftoken'; // The name of the cookie to use for the CSRF token                                                        │
axios.defaults.xsrfHeaderName = 'X-CSRFToken'; // The name of the HTTP header to use for the CSRF token
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

