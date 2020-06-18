import React from "react";
import "./App.css";

import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import ReactGA from "react-ga";

import HypeLanding from "./hype-page/hype-landing/HypeLanding";
import HypeExternalMissingInfo from "./hype-page/additional-info/HypeExternalMissingInfo";
import HypeAdditionalInfo from "./hype-page/additional-info/HypeAdditionalInfo";

import EventClientBase from "./event-client/EventClientBase";

import PageNotFound from "./not-found-page/PageNotFound";

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
            <Route exact path="/event/:eventid">
              <EventClientBase />
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
