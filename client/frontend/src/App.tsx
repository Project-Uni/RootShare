import React from 'react';
import './App.css';

import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { updateUser } from './redux/actions/user';

import HypeExternalMissingInfo from './hype-page/additional-info/HypeExternalMissingInfo';
import HypeAdditionalInfo from './hype-page/additional-info/HypeAdditionalInfo';
import EventClientBase from './event-client/EventClientBase';
import PageNotFound from './not-found-page/PageNotFound';
import Login from './login/Login';
import ResetPassword from './login/ResetPassword';
import SocketManager from './main-platform/SocketManager';

import LandingPage from './landing-page/LandingPage';

import {
  Homepage,
  Discover,
  Events,
  Profile,
  CommunityDetails,
  YourCommunities,
  StreamLibrary,
  Connections,
} from './main-platform';

import { AdminRoutes } from './routes';

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
  return (
    <div className="App">
      <SocketManager />
      <Router history={history}>
        <div className="wrapper">
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route
              exact
              path="/register/external"
              component={HypeExternalMissingInfo}
            />
            <Route
              exact
              path="/register/initialize"
              component={HypeAdditionalInfo}
            />
            <Route
              exact
              path="/register/resetPassword/:emailtoken"
              component={ResetPassword}
            />
            <Route exact path="/event/:eventid" component={EventClientBase} />
            <Route exact path="/login" component={Login} />

            <Route path="/admin" component={AdminRoutes} />

            <Route exact path="/home" component={Homepage} />
            <Route exact path="/discover" component={Discover} />
            <Route exact path="/events" component={Events} />
            <Route exact path="/profile/:profileID" component={Profile} />
            <Route exact path="/communities/:userID" component={YourCommunities} />
            <Route exact path="/community/:orgID" component={CommunityDetails} />
            <Route exact path="/library" component={StreamLibrary} />
            <Route exact path="/connections/:userID" component={Connections} />

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
