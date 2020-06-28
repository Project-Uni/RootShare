import React from "react";
import "./App.css";

import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import ReactGA from "react-ga";

import HypeLanding from "./hype-page/hype-landing/HypeLanding";
import HypeExternalMissingInfo from "./hype-page/additional-info/HypeExternalMissingInfo";
import HypeAdditionalInfo from "./hype-page/additional-info/HypeAdditionalInfo";
import PublisherStreamHolder from './webinar-platform/stream-handling/PublisherStreamHolder'
import ViewerStreamHolder from './webinar-platform/stream-handling/ViewerStreamHolder'
import HostStreamHolder from './webinar-platform/stream-handling/HostStreamHolder'

import EventClientBase from "./event-client/EventClientBase";

import PageNotFound from "./not-found-page/PageNotFound";

import UserCount from "./admin-utility/UserCount";

const analyticsTrackingID = "UA-169916177-1";
ReactGA.initialize(analyticsTrackingID);
ReactGA.pageview("/");

const history = createBrowserHistory();
history.listen((location) => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

function App() {
  return (
    <div className="App">
      <Router history={history}>
        <div className="wrapper">
          <Switch>
            <Route exact path="/">
              <HypeLanding />
            </Route>
            <Route exact path="/profile/externalRegister">
              <HypeExternalMissingInfo />
            </Route>
            <Route exact path="/profile/initialize">
              <HypeAdditionalInfo />
            </Route>
            <Route exact path="/webinar/host">
              <HostStreamHolder />
            </Route>
            <Route exact path="/webinar/publisher">
              <PublisherStreamHolder />
            </Route>
            <Route exact path="/webinar/viewer">
              <ViewerStreamHolder />
            </Route>
            <Route exact path="/event/:eventid">
              <EventClientBase />
            </Route>

            {/* REMOVE THIS BEFORE FINAL PRODUCT */}
            <Route exact path="/admin/count">
              <UserCount />
            </Route>
            <Route>
              <PageNotFound />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
