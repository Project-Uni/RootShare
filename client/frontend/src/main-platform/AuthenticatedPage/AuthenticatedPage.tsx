import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/functions';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar } from '../reusable-components';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
  HEADER_HEIGHT,
} from '../../helpers/constants';

import { AVAILABLE_TABS } from '../reusable-components/components/MainNavigator';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
  },
  body: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

type Props = {
  accessToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
  component: JSX.Element;
  leftElement?: JSX.Element;
  showLeftElementWidth?: number;
  rightElement?: JSX.Element;
  showRightElementWidth?: Number;
  selectedTab?: AVAILABLE_TABS;
};

function AuthenticatedPage(props: Props) {
  const styles = useStyles();

  const {
    component,
    leftElement,
    showLeftElementWidth,
    rightElement,
    showRightElementWidth,
    selectedTab,
    accessToken,
  } = props;

  const [loading, setLoading] = useState(true);
  const [loginRedirect, setLoginRedirect] = useState(false);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [width, setWidth] = useState(window.innerWidth);

  const showLeftEl = useRef(showLeftElementWidth || SHOW_HEADER_NAVIGATION_WIDTH);
  const showRightEl = useRef(showRightElementWidth || SHOW_DISCOVERY_SIDEBAR_WIDTH);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    checkAuth().then(async (authenticated) => {
      if (authenticated) {
        setLoading(false);
      } else {
        setLoginRedirect(true);
      }
    });
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
    setWidth(window.innerWidth);
  }

  async function checkAuth() {
    return Boolean(accessToken);
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && (
        <Redirect to={`/login?redirect=${window.location.pathname}`} />
      )}
      <EventClientHeader showNavigationWidth={showLeftEl.current} />
      {!loading && (
        <div className={styles.body} style={{ height: height }}>
          {width > showLeftEl.current &&
            (leftElement ? (
              leftElement
            ) : (
              <MainNavigator currentTab={selectedTab || 'none'} />
            ))}
          {component}
          {width > showRightEl.current &&
            (rightElement ? rightElement : <DiscoverySidebar />)}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
    updateAccessToken: (accessToken: string) => {
      dispatch(updateAccessToken(accessToken));
    },
    updateRefreshToken: (refreshToken: string) => {
      dispatch(updateRefreshToken(refreshToken));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticatedPage);
