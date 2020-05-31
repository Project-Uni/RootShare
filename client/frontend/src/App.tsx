import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HypeLanding from "./hype-page/hype-landing/HypeLanding";
import HypeExternalMissingInfo from "./hype-page/additional-info/HypeExternalMissingInfo";
import HypeAdditionalInfo from "./hype-page/additional-info/HypeAdditionalInfo";
import HypeAdditionalComplete from "./hype-page/additional-info/HypeAdditionalComplete"

function App() {
  return (
    <div className="App">
      <Router>
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
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
