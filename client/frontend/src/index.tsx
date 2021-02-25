import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { Provider } from 'react-redux';
import { store, PersistedStore } from './redux/store/persistedStore';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { CircularProgress } from '@material-ui/core';
import Theme from './theme/Theme';

ReactDOM.render(
  <Provider store={store}>
    <PersistGate
      persistor={PersistedStore}
      loading={
        <div
          style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress style={{ color: Theme.bright }} size={100} />
        </div>
      }
    >
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
