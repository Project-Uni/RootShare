import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { RSText } from '../../../base-components';
import { PortalMembers, PortalEvents } from './tabs';

import Theme from '../../../theme/Theme';
import { getCommunityAdminPortal } from '../../../api';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

export const CommunityAdminPortal = (props: Props) => {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState(false);

  const { selectedTab } = useSelector((state: RootshareReduxState) => ({
    selectedTab: state.communityAdminPortalTab,
  }));

  useEffect(() => {
    fetchTabData();
  }, [selectedTab]);

  const fetchTabData = async () => {
    setLoading(true);
    const data = await getCommunityAdminPortal(selectedTab);
    if (data.success !== 1) setFetchErr(true);
    setLoading(false);
  };

  const renderPortalTab = () => {
    switch (selectedTab) {
      case 'members':
        return <PortalMembers />;
      case 'events':
        return <PortalEvents />;
      default:
        return <div />;
    }
  };

  return fetchErr ? (
    <div style={{ width: 400, textAlign: 'left', marginTop: 10 }}>
      <RSText type="body" size={14} bold color={Theme.error}>
        There was an error getting the {selectedTab}
      </RSText>
    </div>
  ) : (
    renderPortalTab()
  );
};
