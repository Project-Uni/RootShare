import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import {
  UserCount,
  AdminEventCreator,
  AdminCommunityManager,
  AdminHub,
  AdminDBQuery,
} from '../admin-utility';

import PageNotFound from '../not-found-page/PageNotFound';
import { RootshareReduxState } from '../redux/store/stateManagement';

export default function AdminRoutes() {
  const { privilegeLevel } = useSelector((state: RootshareReduxState) => state.user);

  if (privilegeLevel >= 6)
    return (
      <Switch>
        <Route exact path="/admin" component={AdminHub} />
        <Route exact path="/admin/count" component={UserCount} />
        <Route exact path="/admin/event" component={AdminEventCreator} />
        <Route exact path="/admin/community" component={AdminCommunityManager} />
        <Route exact path="/admin/database" component={AdminDBQuery} />
        <Route component={PageNotFound} />
      </Switch>
    );
  else return <Route component={PageNotFound} />;
}
