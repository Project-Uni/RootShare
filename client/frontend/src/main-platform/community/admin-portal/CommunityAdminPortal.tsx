import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { CircularProgress } from '@material-ui/core';

import { PortalMembers, PortalEvents } from './tabs';

import { getIsCommunityAdminCheck } from '../../../api';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

export const CommunityAdminPortal = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();

  const { communityID } = useParams<{ communityID: string }>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = useCallback(async () => {
    const data = await getIsCommunityAdminCheck(communityID);
    if (!data.successful || !data.content.isCommunityAdmin)
      history.push(`/community/${communityID}`);
    else setLoading(false);
  }, []);

  const { selectedTab } = useSelector((state: RootshareReduxState) => ({
    selectedTab: state.communityAdminPortalTab,
  }));

  const renderPortalTab = () => {
    switch (selectedTab) {
      case 'members':
        return <PortalMembers communityID={communityID} />;
      case 'events':
        return <PortalEvents communityID={communityID} />;
      default:
        return <div />;
    }
  };

  return loading ? <CircularProgress size={100} /> : renderPortalTab();
};
