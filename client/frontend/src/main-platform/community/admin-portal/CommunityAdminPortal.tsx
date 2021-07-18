import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { PortalMembers, PortalEvents } from './tabs';

import { CommunityAdminPortalContext } from './AdminPortalContext';

type Props = {};

export const CommunityAdminPortal = (props: Props) => {
  const { communityID } = useParams<{ communityID: string }>();

  const { selectedTab, setSelectedTab } = React.useContext(
    CommunityAdminPortalContext
  );

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
