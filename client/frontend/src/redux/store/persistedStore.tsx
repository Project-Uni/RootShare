import { createStore, compose, applyMiddleware } from 'redux';
import allReducers from '../reducers';
import logger from 'redux-logger';
import { saveState, loadState } from './stateManagement';

const middleware = [logger];
const enhancers = [];

const devToolsExtension = (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__() || compose;
if (typeof devToolsExtension === 'function') {
  enhancers.push(devToolsExtension);
}

const composeEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
);

export const PersistedStore = createStore(
  allReducers,
  loadState(),
  composeEnhancers
);

PersistedStore.subscribe(() => {
  saveState(PersistedStore.getState());
});