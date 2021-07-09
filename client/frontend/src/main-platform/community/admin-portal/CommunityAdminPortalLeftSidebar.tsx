import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import {
  updateCommunityAdminPortalTab,
  resetCommunityAdminPortalTab,
} from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { CommunityAdminPortalTabContext } from '../../../App';

import { BiArrowBack } from 'react-icons/bi';

import { RSText } from '../../../base-components';
import { RSCard, RSLink } from '../../reusable-components';

import Theme from '../../../theme/Theme';
import { capitalizeFirstLetter } from '../../../helpers/functions';
import { RSCARD_WRAPPER_MARGIN } from '../../reusable-components/components/RSCard';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    padding: 40,
    marginRight: 50,
    width: SIDEBAR_WIDTH,
  },
}));

const SIDEBAR_WIDTH = 230;
const WRAPPER_PADDING = 40;
const MARGIN_RIGHT = 50;
export const COMMUNITY_LEFT_SIDEBAR_OFFSET =
  SIDEBAR_WIDTH + WRAPPER_PADDING * 2 + MARGIN_RIGHT + RSCARD_WRAPPER_MARGIN;

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

  const { communityID } = useParams<{ communityID: string }>();

  // const { selectedTab } = useSelector((state: RootshareReduxState) => ({
  //   selectedTab: state.communityAdminPortalTab,
  // }));

  useEffect(() => {
    dispatch(resetCommunityAdminPortalTab());
  }, []);

  const renderTab = (
    tab: CommunityAdminPortalTab,
    selectedTab: CommunityAdminPortalTab,
    setSelectedTab: React.Dispatch<React.SetStateAction<CommunityAdminPortalTab>>
  ) => {
    const isCurrentTab = tab === selectedTab;

    return (
      // <RSLink onClick={() => dispatch(updateCommunityAdminPortalTab(tab))}>
      <RSLink onClick={() => setSelectedTab(tab)}>
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
    <CommunityAdminPortalTabContext.Consumer>
      {(context) => (
        <div>
          <RSCard background="secondary">
            <div className={styles.wrapper}>
              <RSLink
                style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}
                underline="hover"
                href={`/community/${communityID}`}
              >
                <BiArrowBack style={{ marginRight: 5 }} />
                <RSText size={14} color={Theme.secondaryText}>
                  Back to Community
                </RSText>
              </RSLink>

              {COMMUNITY_ADMIN_PORTAL_TABS.map((tab) =>
                renderTab(tab, context.selectedTab, context.setSelectedTab)
              )}
            </div>
          </RSCard>
        </div>
      )}
    </CommunityAdminPortalTabContext.Consumer>
  );
};
