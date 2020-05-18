import React from "react";
import "./App.css";

import HypeLanding from "./hype-page/hype-landing/HypeLanding";
import HypeRegistration from "./hype-page/hype-registration/HypeRegistration";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <div className="wrapper">
          <Switch>
            <Route exact path="/">
              <HypeLanding />
            </Route>
            <Route exact path="/register">
              <HypeRegistration />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
