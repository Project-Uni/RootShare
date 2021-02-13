import React, { useState, useEffect, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
  HEADER_HEIGHT,
} from '../../helpers/constants';

import { AVAILABLE_TABS } from '../reusable-components/components/MainNavigator';
import Theme from '../../theme/Theme';
import { HoverPreview } from '../reusable-components';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { checkProfilePictureExpired } from '../../helpers/functions';
import { updateProfilePicture } from '../../redux/actions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    background: Theme.background,
  },
  body: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: 1300,
  },
  bodyContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
}));

type Props = {
  component: JSX.Element;
  leftElement?: JSX.Element;
  showLeftElementWidth?: number;
  rightElement?: JSX.Element;
  showRightElementWidth?: Number;
  selectedTab?: AVAILABLE_TABS;
};

function AuthenticatedPage(props: Props) {
  const styles = useStyles();
  const dispatch = useDispatch();
  const { accessToken, profilePictureLastUpdated, userID } = useSelector(
    (state: RootshareReduxState) => ({
      userID: state.user._id,
      accessToken: state.accessToken,
      profilePictureLastUpdated: state.user.profilePictureLastUpdated,
    })
  );

  const {
    component,
    leftElement,
    showLeftElementWidth,
    rightElement,
    showRightElementWidth,
    selectedTab,
  } = props;

  const [loading, setLoading] = useState(true);
  const [loginRedirect, setLoginRedirect] = useState(false);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [width, setWidth] = useState(window.innerWidth);

  const showLeftEl = useRef(showLeftElementWidth || SHOW_HEADER_NAVIGATION_WIDTH);
  const showRightEl = useRef(showRightElementWidth || SHOW_DISCOVERY_SIDEBAR_WIDTH);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    checkAuth();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
    setWidth(window.innerWidth);
  }

  const checkAuth = useCallback(async () => {
    if (Boolean(accessToken)) {
      if (profilePictureLastUpdated) {
        const { success, profilePicture } = await checkProfilePictureExpired(
          profilePictureLastUpdated,
          userID
        );
        if (success === 1) {
          dispatch(updateProfilePicture(profilePicture));
        }
      }
      setLoading(false);
    } else {
      setLoginRedirect(true);
    }
  }, [accessToken, profilePictureLastUpdated]);

  return (
    <div className={styles.wrapper}>
      {loginRedirect && (
        <Redirect to={`/login?redirect=${window.location.pathname}`} />
      )}

      <EventClientHeader showNavigationWidth={showLeftEl.current} />
      <div className={styles.bodyContainer}>
        {!loading && (
          <div className={styles.body} style={{ height: height }}>
            {width > showLeftEl.current &&
              (leftElement ? (
                leftElement
              ) : (
                <MainNavigator currentTab={selectedTab || 'none'} />
              ))}
            <div
              style={{ flex: 1, overflow: 'scroll', background: Theme.background }}
              id="mainComponent"
            >
              <HoverPreview />
              {component}
            </div>
            {width > showRightEl.current &&
              (rightElement ? rightElement : <DiscoverySidebar />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthenticatedPage;
