import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useDispatch, useSelector } from 'react-redux';
import {
  updateCommunityAdminPortalTab,
  resetCommunityAdminPortalTab,
} from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { RSText } from '../../../base-components';
import { RSCard, RSLink } from '../../reusable-components';

import Theme from '../../../theme/Theme';
import { capitalizeFirstLetter } from '../../../helpers/functions';
import { NAVIGATOR_WIDTH } from '../../reusable-components/components/MainNavigator';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    padding: 40,
    marginRight: 50,
    width: NAVIGATOR_WIDTH - 80,
  },
}));

export const COMMUNITY_ADMIN_PORTAL_TABS = [
  'members',
  'events',
  // 'news',
  // 'forms',
  // 'finance',
  // 'service hours',
] as const;

export type CommunityAdminPortalTab = typeof COMMUNITY_ADMIN_PORTAL_TABS[number];

type Props = {};

export const CommunityAdminPortalLeftSidebar = (props: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();

  const { selectedTab } = useSelector((state: RootshareReduxState) => ({
    selectedTab: state.communityAdminPortalTab,
  }));

  useEffect(() => {
    // dispatch(resetCommunityAdminPortalTab());
    dispatch(updateCommunityAdminPortalTab('events'));
  }, []);

  const renderTab = (tab: CommunityAdminPortalTab) => {
    const isCurrentTab = tab === selectedTab;

    return (
      <RSLink onClick={() => dispatch(updateCommunityAdminPortalTab(tab))}>
        <RSText
          size={16}
          weight={isCurrentTab ? 'bold' : 'light'}
          color={isCurrentTab ? Theme.bright : Theme.secondaryText}
          style={{ padding: 10 }}
        >
          {capitalizeFirstLetter(tab)}
        </RSText>
      </RSLink>
    );
  };

  return (
    <div>
      <RSCard className={styles.wrapper} background="secondary">
        {COMMUNITY_ADMIN_PORTAL_TABS.map((tab) => renderTab(tab))}
      </RSCard>
    </div>
  );
};
