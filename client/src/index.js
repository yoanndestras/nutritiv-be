import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { createStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import entities from './Redux/config/entities';
import { injectStore } from './Api/nutritivApi';

export const store = createStore(
  entities,
  /* preloadedState, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && 
  window.__REDUX_DEVTOOLS_EXTENSION__({
    trace: true
  })
);

// INJECT STORE TO USE IT IN AXIOS INTERCEPTORS
injectStore(store);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);