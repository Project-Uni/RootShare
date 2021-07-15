import React, { createContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
// import { CommunityAdminPortalTabContext } from '../../../App';

import { PortalMembers, PortalEvents } from './tabs';

import { CommunityAdminPortalTab } from './CommunityAdminPortalLeftSidebar';
import { AdminPortalContext } from './AdminPortalContext';

type Props = {};

export const CommunityAdminPortal = (props: Props) => {
  const { communityID } = useParams<{ communityID: string }>();

  useEffect(() => {
    setTimeout(() => {
      updateTab('events');
      console.log(selectedTab);
    }, 3000);
  }, []);

  const { selectedTab, updateTab } = React.useContext(AdminPortalContext);

  const renderPortalTab = (selectedTab: string) => {
    switch (selectedTab) {
      case 'members':
        return <PortalMembers communityID={communityID} />;
      case 'events':
        return <PortalEvents communityID={communityID} />;
      default:
        return <div />;
    }
  };

  return renderPortalTab(selectedTab);
};
