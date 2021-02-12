import React from 'react';
import './App.css';

import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';

import HypeExternalMissingInfo from './hype-page/additional-info/HypeExternalMissingInfo';
import HypeAdditionalInfo from './hype-page/additional-info/HypeAdditionalInfo';
import EventClientBase from './event-client/EventClientBase';
import PageNotFound from './not-found-page/PageNotFound';
import Login from './login/Login';
import ResetPassword from './login/ResetPassword';
import SocketManager from './main-platform/SocketManager';

import LandingPage from './landing-page/LandingPage';

import {
  MeetTheGreeks,
  HomepageBody,
  ProfileBody,
  EventsBody,
  ConnectionsBody,
  CommunityBody,
  YourCommunitiesBody,
} from './main-platform';

import { AdminRoutes } from './routes';
import AuthenticatedPage from './main-platform/AuthenticatedPage/AuthenticatedPage';
import {
  HoverPreview,
  SnackbarNotification,
} from './main-platform/reusable-components';
import FollowSidebar from './main-platform/community/components/Sidebar/FollowSidebar';

const analyticsTrackingID = 'UA-169916177-1';
ReactGA.initialize(analyticsTrackingID);
ReactGA.pageview('/');

const history = createBrowserHistory();
history.listen((location) => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

const App = () => {
  return (
    <div className="App">
      <SocketManager />
      <HoverPreview />
      <SnackbarNotification />
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

            <Route
              exact
              path="/home"
              render={(props) => (
                <AuthenticatedPage
                  {...props}
                  component={<HomepageBody {...props} />}
                  selectedTab="home"
                />
              )}
            />
            <Route
              exact
              path="/events"
              render={(props) => (
                <AuthenticatedPage
                  {...props}
                  component={<EventsBody {...props} />}
                  selectedTab="events"
                />
              )}
            />
            <Route
              exact
              path="/profile/:profileID"
              render={(props) => (
                <AuthenticatedPage
                  {...props}
                  component={<ProfileBody {...props} />}
                  selectedTab="profile"
                />
              )}
            />
            <Route
              exact
              path="/communities/:userID"
              render={(props) => (
                <AuthenticatedPage
                  {...props}
                  component={<YourCommunitiesBody {...props} />}
                  selectedTab="communities"
                />
              )}
            />
            <Route
              exact
              path="/community/:orgID"
              render={(props) => (
                <AuthenticatedPage
                  {...props}
                  component={<CommunityBody {...props} />}
                  selectedTab="communities"
                  rightElement={<FollowSidebar {...props} />}
                />
              )}
            />
            <Route
              exact
              path="/connections/:userID"
              render={(props) => (
                <AuthenticatedPage
                  {...props}
                  component={<ConnectionsBody {...props} />}
                  selectedTab="connections"
                />
              )}
            />
            <Route
              exact
              path="/mtg"
              render={(props) => (
                <AuthenticatedPage {...props} component={<MeetTheGreeks />} />
              )}
            />

            <Route component={PageNotFound} />
          </Switch>
        </div>
      </Router>
    </div>
  );
};

export default App;
