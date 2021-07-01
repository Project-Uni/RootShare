import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { RSText } from '../../../base-components';
import { PortalMembers, PortalEvents } from './tabs';

import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

export const CommunityAdminPortal = (props: Props) => {
  const styles = useStyles();
  const { communityID } = useParams<{ communityID: string }>();

  const { selectedTab } = useSelector((state: RootshareReduxState) => ({
    selectedTab: state.communityAdminPortalTab,
  }));

  const renderPortalTab = () => {
    switch (selectedTab) {
      case 'members':
        return <PortalMembers communityID={communityID} />;
      case 'events':
        return <PortalEvents />;
      default:
        return <div />;
    }
  };

  return renderPortalTab();
};