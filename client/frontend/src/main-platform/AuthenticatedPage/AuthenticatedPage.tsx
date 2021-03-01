import React, { useState, useEffect, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
  HEADER_HEIGHT,
} from '../../helpers/constants';

import Theme from '../../theme/Theme';
import { HoverPreview } from '../reusable-components';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { checkProfilePictureExpired } from '../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    background: Theme.background,
  },
  body: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: 1500,
    flex: 1,
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
};

function AuthenticatedPage(props: Props) {
  const styles = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state: RootshareReduxState) => ({
    accessToken: state.accessToken,
  }));

  const {
    component,
    leftElement,
    showLeftElementWidth,
    rightElement,
    showRightElementWidth,
  } = props;

  const [loading, setLoading] = useState(true);
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
      await checkProfilePictureExpired(dispatch);
      setLoading(false);
    } else {
      history.push(`/login?redirect=${history.location.pathname}`);
    }
  }, [accessToken, dispatch, checkProfilePictureExpired]);

  return (
    <div className={styles.wrapper}>
      <EventClientHeader showNavigationWidth={showLeftEl.current} />
      <div className={styles.bodyContainer}>
        {!loading && (
          <div className={styles.body} style={{ height: height }}>
            {width > showLeftEl.current &&
              (leftElement ? leftElement : <MainNavigator />)}
            <div
              style={{ flex: 1, overflow: 'scroll', background: Theme.background }}
              id="mainComponent"
            >
              <HoverPreview />
              {component}
            </div>
            {width > showRightEl.current &&
              (rightElement ? (
                rightElement
              ) : (
                // <DiscoverySidebar />
                <span style={{ width: 270 }}></span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthenticatedPage;
