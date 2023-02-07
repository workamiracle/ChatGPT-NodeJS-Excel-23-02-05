import { legacy_createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import rootReucer from './Reducers';


const initialState = {};

const middleware = [thunk];

const store = legacy_createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);