import React, { useEffect } from 'react';
import './App.css';

import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { updateUser } from './redux/actions/user';

import HypeLanding from './hype-page/hype-landing/HypeLanding';
import HypeExternalMissingInfo from './hype-page/additional-info/HypeExternalMissingInfo';
import HypeAdditionalInfo from './hype-page/additional-info/HypeAdditionalInfo';
import EventClientBase from './event-client/EventClientBase';
import PageNotFound from './not-found-page/PageNotFound';
import Login from './login/Login';

import UserCount from './admin-utility/UserCount';
import AdminEventCreator from './admin-utility/AdminEventCreator';

import axios from 'axios';

const analyticsTrackingID = 'UA-169916177-1';
ReactGA.initialize(analyticsTrackingID);
ReactGA.pageview('/');

const history = createBrowserHistory();
history.listen((location) => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

type Props = {
  user: { [key: string]: any };
  updateUser: (userInfo: { [key: string]: any }) => void;
};

function App(props: Props) {
  useEffect(() => {
    // mockLogin();
  }, []);

  async function mockLogin() {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      const { data } = await axios.get('/api/mockLogin');
      if (data['success'] === 1) props.updateUser({ ...data['content'] });
    }
  }

  return (
    <div className="App">
      <Router history={history}>
        <div className="wrapper">
          <Switch>
            <Route exact path="/" component={HypeLanding} />
            <Route
              exact
              path="/profile/externalRegister"
              component={HypeExternalMissingInfo}
            />
            <Route exact path="/profile/initialize" component={HypeAdditionalInfo} />
            <Route exact path="/event/:eventid" component={EventClientBase} />
            <Route exact path="/login" component={Login} />

            <Route exact path="/admin/count" component={UserCount} />
            <Route exact path="/admin/createEvent" component={AdminEventCreator} />
            <Route component={PageNotFound} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
