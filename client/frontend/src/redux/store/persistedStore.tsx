import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import allReducers from '../reducers';
import logger from 'redux-logger';
import { initializeState, RootshareReduxState } from './stateManagement';
import {
  persistStore as createPersistedStore,
  persistReducer as createPersistedReducer,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const middleware = [logger];
const enhancers = [];

const devToolsExtension =
  ((window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__()) ||
  compose;
if (
  process.env.NODE_ENV === 'development' &&
  typeof devToolsExtension === 'function'
) {
  enhancers.push(devToolsExtension);
}

const composeEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};

const persistedReducer = createPersistedReducer<RootshareReduxState>(
  persistConfig,
  allReducers
);

export const store = createStore(
  persistedReducer,
  // {
  //   ...initializeState(),
  //   _persist: {
  //     version: 1.0,
  //     rehydrated: true,
  //   },
  // },
  composeEnhancers
);
export const PersistedStore = createPersistedStore(store);

export function getStore() {
  return store;
}
