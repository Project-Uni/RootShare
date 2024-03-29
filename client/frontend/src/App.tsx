import React, { useState, createContext } from 'react';
import './App.css';

import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';

import EventClientBase from './event-client/EventClientBase';
import PageNotFound from './not-found-page/PageNotFound';
import ResetPassword from './login/ResetPassword';
import SocketManager from './main-platform/SocketManager';

import LandingPage from './landing-page/redesign/LandingPage'; //NEW LANDING PAGE
import ForgotPasswordCard from './login/ForgotPasswordCard';

import {
  MeetTheGreeks,
  HomepageBody,
  ProfileBody,
  Community,
  CommunityAdminPortal,
  CommunityAdminPortalLeftSidebar,
  EventsBody,
  ConnectionsBody,
  YourCommunitiesBody,
  PostPage,
  EventInfoPage,
} from './main-platform';

import { AdminRoutes } from './routes';
import {
  AuthenticatedPage,
  OptionalAuthenticatedPage,
} from './main-platform/base-page-frames';
import { SnackbarNotification } from './main-platform/reusable-components';
import AccountTypeSelect from './landing-page/redesign/AccountTypeSelect'; //NEW ACCOUNT TYPE SELECT
import { ThemeProvider } from '@material-ui/styles';
import { muiTheme } from './theme/Theme';
import { CommunityAdminPortalContextWrapper } from './main-platform/community/admin-portal/AdminPortalContext';

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
      <SnackbarNotification />
      <Router history={history}>
        <div className="wrapper">
          <ThemeProvider theme={muiTheme}>
            <Switch>
              <Route exact path="/" render={() => <LandingPage mode="register" />} />
              <Route
                exact
                path="/account/verify"
                render={() => <LandingPage mode="verify" />}
              />
              <Route exact path="/account/select" component={AccountTypeSelect} />
              <Route
                exact
                path="/account/initialize"
                render={() => <LandingPage mode="additional" />}
              />
              <Route
                exact
                path="/login"
                render={() => <LandingPage mode="login" />}
              />
              <Route
                exact
                path="/account/forgotPassword"
                render={() => <ForgotPasswordCard />}
              />

              <Route
                exact
                path="/register/resetPassword/:emailtoken"
                component={ResetPassword}
              />

              <Route exact path="/event/:eventid" component={EventClientBase} />
              <Route path="/admin" component={AdminRoutes} />
              <Route
                exact
                path="/home"
                render={(props) => (
                  <AuthenticatedPage component={<HomepageBody />} />
                )}
              />
              <Route
                exact
                path="/events"
                render={(props) => <AuthenticatedPage component={<EventsBody />} />}
              />
              <Route
                exact
                path="/profile/:profileID"
                render={(props) => <AuthenticatedPage component={<ProfileBody />} />}
              />
              <Route
                exact
                path="/communities/:userID"
                render={(props) => (
                  <AuthenticatedPage component={<YourCommunitiesBody />} />
                )}
              />
              <Route
                exact
                path="/community/:communityID"
                render={(props) => <AuthenticatedPage component={<Community />} />}
              />
              <Route
                exact
                path="/community/:communityID/admin"
                render={(props) => (
                  <CommunityAdminPortalContextWrapper>
                    <AuthenticatedPage
                      component={<CommunityAdminPortal />}
                      leftElement={<CommunityAdminPortalLeftSidebar />}
                      rightElement={<span />}
                      showNavigationMenuDefault
                    />
                  </CommunityAdminPortalContextWrapper>
                )}
              />
              <Route
                exact
                path="/connections/:userID"
                render={(props) => (
                  <AuthenticatedPage component={<ConnectionsBody />} />
                )}
              />
              <Route
                exact
                path="/grand-prix"
                render={(props) => (
                  <AuthenticatedPage {...props} component={<MeetTheGreeks />} />
                )}
              />
              <Route
                exact
                path="/post/:postID"
                render={(props) => <AuthenticatedPage component={<PostPage />} />}
              />
              <Route
                exact
                path="/eventInfo/:eventID"
                render={(props) => (
                  <OptionalAuthenticatedPage component={<EventInfoPage />} />
                )}
              />
              <Route component={PageNotFound} />
            </Switch>
          </ThemeProvider>
        </div>
      </Router>
    </div>
  );
};

export default App;
