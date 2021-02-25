import { createStore, compose, applyMiddleware } from 'redux';
import allReducers from '../reducers';
import logger from 'redux-logger';
import { RootshareReduxState } from './stateManagement';
import {
  persistStore,
  persistReducer as createPersistedReducer,
  PersistConfig,
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

const persistConfig: PersistConfig<RootshareReduxState> = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
  blacklist: ['registration'],
};

const persistedReducer = createPersistedReducer<RootshareReduxState>(
  persistConfig,
  allReducers
);

export const store = createStore(persistedReducer, composeEnhancers);
export const persistor = persistStore(store);

export function getStore() {
  return store;
}
