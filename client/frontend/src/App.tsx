import React from "react";
import "./App.css";

import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import ReactGA from "react-ga";

import HypeLanding from "./hype-page/hype-landing/HypeLanding";
import HypeExternalMissingInfo from "./hype-page/additional-info/HypeExternalMissingInfo";
import HypeAdditionalInfo from "./hype-page/additional-info/HypeAdditionalInfo";
import PublisherStreamHolder from './webinar-platform/stream-handling/PublisherStreamHolder';
import ViewerStreamHolder from './webinar-platform/stream-handling/ViewerStreamHolder';
import HostStreamHolder from './webinar-platform/stream-handling/HostStreamHolder';

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
            <Route exact path="/" component={HypeLanding} />
            <Route exact path="/profile/externalRegister" component={HypeExternalMissingInfo} />
            <Route exact path="/profile/initialize" component={HypeAdditionalInfo} />
            <Route exact path="/webinar/host" component={HostStreamHolder} />
            <Route exact path="/webinar/publisher" component={PublisherStreamHolder} />
            <Route exact path="/webinar/viewer" component={ViewerStreamHolder} />
            <Route exact path="/event/:eventid" component={EventClientBase} />
            {/* REMOVE THIS BEFORE FINAL PRODUCT */}
            <Route exact path="/admin/count" component={UserCount} />
            <Route component={PageNotFound} />
          </Switch>
        </div>
      </Router>
    </div >
  );
}

export default App;
