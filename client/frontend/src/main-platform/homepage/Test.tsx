import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

const ALL_VALUES: number[] = [];
for (let i = 0; i < 100; i++) {
  ALL_VALUES.push(i);
}

function getPreviousValues(numRetrieved: number, startingValue: number) {
  return ALL_VALUES.slice(
    startingValue - numRetrieved >= 0 ? startingValue - numRetrieved : 0,
    startingValue
  );
}

function getNextValues(numRetrieved: number, startingValue: number) {
  return ALL_VALUES.slice(startingValue + 1, startingValue + numRetrieved);
}

const NUM_RETRIEVED = 10;
const MAX_PAGES = Math.ceil(100 / NUM_RETRIEVED) + 1;

function TestComponent(props: Props) {
  const styles = useStyles();

  const [loginRedirect, setLoginRedirect] = useState(false);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [width, setWidth] = useState(window.innerWidth);

  const [loaded, setLoaded] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [page, setPage] = useState(1);
  const prevPage = usePrevious(page);
  const [currentValues, setCurrentValues] = useState<number[]>([]);

  let bottomBoundaryRef = useRef(null);
  let topBoundaryRef = useRef(null);

  const scrollObserver = useCallback(
    (node: any, direction: 'top' | 'bottom') => {
      const intObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0 && !inProgress) {
            if (direction === 'bottom' && page < MAX_PAGES) setPage(page + 1);
            else if (direction === 'top' && page > 1) setPage(page - 1);
            intObs.unobserve(node);
          }
        });
      });
      intObs.observe(node);
    },
    [page]
  );

  useEffect(() => {
    if (bottomBoundaryRef.current) {
      scrollObserver(bottomBoundaryRef.current, 'bottom');
    }
    if (topBoundaryRef.current) {
      scrollObserver(topBoundaryRef.current, 'top');
    }
  }, [scrollObserver, bottomBoundaryRef, topBoundaryRef]);

  useEffect(() => {
    if (loaded && !inProgress) {
      setInProgress(true);
      if (page > (prevPage || 0)) {
        setCurrentValues((prevState: number[]) => {
          return [
            ...prevState.slice(4, prevState.length),
            ...getNextValues(8, prevState[prevState.length - 1]),
          ];
        });
      } else {
        setCurrentValues((prevState: number[]) => {
          return [
            ...getPreviousValues(8, prevState[0]),
            ...prevState.slice(0, prevState.length - 4),
          ];
        });
      }
      setInProgress(false);
    }
  }, [page]);

  useEffect(() => {
    setCurrentValues(getNextValues(10, -1));
    setLoaded(true);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    checkAuth().then(async (authenticated) => {
      if (!authenticated) {
        setLoginRedirect(true);
      }
    });
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
    setWidth(window.innerWidth);
  }

  async function checkAuth() {
    const { data } = await makeRequest(
      'GET',
      '/user/getCurrent',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] !== 1) {
      props.updateUser({});
      props.updateAccessToken('');
      props.updateRefreshToken('');
      return false;
    }
    return true;
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/test`} />}
      <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
      <div className={styles.body} style={{ height: height }}>
        {width > SHOW_HEADER_NAVIGATION_WIDTH && <MainNavigator currentTab="home" />}
        <div style={{ flex: 1, overflow: 'scroll' }}>
          <div
            id="page-top-boundary"
            ref={topBoundaryRef}
            style={{ border: '1px solid red' }}
          ></div>
          {currentValues.map((value) => (
            <div
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                border: '1px solid black',
              }}
            >
              <h1>{value}</h1>
            </div>
          ))}
          <div
            id="page-bottom-boundary"
            ref={bottomBoundaryRef}
            style={{ border: '1px solid red' }}
          ></div>
        </div>

        {width > SHOW_DISCOVERY_SIDEBAR_WIDTH && <DiscoverySidebar />}
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
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

export default connect(mapStateToProps, mapDispatchToProps)(TestComponent);

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
