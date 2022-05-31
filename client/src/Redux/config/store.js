import { configureStore } from '@reduxjs/toolkit';
import combineReducers from './reducer';

export default function store() {
  return configureStore({
    combineReducers,
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    //     middleware1, 
    //     middleware2,
    // )
  })
}
