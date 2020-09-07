import React from 'react';
import { Route, Switch } from 'react-router-dom';

import {
  UserCount,
  AdminEventCreator,
  AdminCommunityManager,
  AdminHub,
} from '../admin-utility';

import PageNotFound from '../not-found-page/PageNotFound';

export default function AdminRoutes() {
  return (
    <Switch>
      <Route exact path="/admin" component={AdminHub} />
      <Route exact path="/admin/count" component={UserCount} />
      <Route exact path="/admin/event" component={AdminEventCreator} />
      <Route exact path="/admin/community" component={AdminCommunityManager} />
      <Route component={PageNotFound} />
    </Switch>
  );
}
