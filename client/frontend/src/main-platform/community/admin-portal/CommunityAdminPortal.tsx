import React, { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import { PortalMembers, PortalEvents } from './tabs';

import { CommunityAdminPortalContext } from './AdminPortalContext';
import { getIsCommunityAdminCheck } from '../../../api';
import { CircularProgress } from '@material-ui/core';

type Props = {};

export const CommunityAdminPortal = (props: Props) => {
  const history = useHistory();

  const [loading, setLoading] = useState(true);

  const { communityID } = useParams<{ communityID: string }>();

  const { selectedTab, setSelectedTab } = React.useContext(
    CommunityAdminPortalContext
  );

  const checkAdmin = useCallback(async () => {
    const data = await getIsCommunityAdminCheck(communityID);
    if (!data.successful || !data.content.isCommunityAdmin)
      history.push(`/community/${communityID}`);
    else setLoading(false);
  }, []);

  useEffect(() => {
    checkAdmin();
  }, []);

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

  return loading ? <CircularProgress size={100} /> : renderPortalTab(selectedTab);
};
