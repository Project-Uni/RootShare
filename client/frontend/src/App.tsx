import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HypeLanding from "./hype-page/hype-landing/HypeLanding";
import HypeAdditionalInfo from "./hype-page/additional-info/HypeAdditionalInfo";
import HypeExternalMissingInfo from "./hype-page/additional-info/HypeExternalMissingInfo";

function App() {
  return (
    <div className="App">
      <Router>
        <div className="wrapper">
          <Switch>
            <Route exact path="/">
              <HypeLanding />
            </Route>
            <Route exact path="/profile/initialize">
              <HypeAdditionalInfo />
            </Route>
            <Route exact path="/profile/externalRegister">
              <HypeExternalMissingInfo />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
