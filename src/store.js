import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger'
import reducer from './reducer';

export const store = createStore(reducer,applyMiddleware(createLogger()));