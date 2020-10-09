import React, { useState, useEffect, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator, DiscoverySidebar, Loader } from '../reusable-components';

import {
  SHOW_HEADER_NAVIGATION_WIDTH,
  SHOW_DISCOVERY_SIDEBAR_WIDTH,
  HEADER_HEIGHT,
} from '../../helpers/constants';
import { CircularProgress } from '@material-ui/core';

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

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function getPreviousValues(
  numRetrieved: number,
  startingValue: number,
  withTimeout = false
) {
  if (withTimeout) {
    await sleep(1);
  }
  return ALL_VALUES.slice(
    startingValue - numRetrieved >= 0 ? startingValue - numRetrieved : 0,
    startingValue
  );
}

async function getNextValues(
  numRetrieved: number,
  startingValue: number,
  withTimeout = false
) {
  if (withTimeout) {
    await sleep(1);
  }
  return ALL_VALUES.slice(startingValue + 1, startingValue + numRetrieved + 1);
}

const NUM_RETRIEVED = 10;
const MAX_PAGES = Math.ceil(100 / NUM_RETRIEVED) + 1;

function TestComponent(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [width, setWidth] = useState(window.innerWidth);

  const [loaded, setLoaded] = useState(false);

  const [page, setPage] = useState(1);
  const prevPage = usePrevious(page);
  const [currentValues, setCurrentValues] = useState<JSX.Element[]>([]);
  const [loading, setLoading] = useState(true);

  // const scrollObserver = useCallback(
  //   (node: any, direction: 'top' | 'bottom') => {
  //     const intObs = new IntersectionObserver((entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.intersectionRatio > 0 && !inProgress) {
  //           if (direction === 'bottom' && page < MAX_PAGES) setPage(page + 1);
  //           else if (direction === 'top' && page > 1) setPage(page - 1);
  //           intObs.unobserve(node);
  //         }
  //       });
  //     });
  //     intObs.observe(node);
  //   },
  //   [page]
  // );

  // useEffect(() => {
  //   if (bottomBoundaryRef.current) {
  //     scrollObserver(bottomBoundaryRef.current, 'bottom');
  //   }
  //   if (topBoundaryRef.current) {
  //     scrollObserver(topBoundaryRef.current, 'top');
  //   }
  // }, [scrollObserver, bottomBoundaryRef, topBoundaryRef]);

  // useEffect(() => {
  //   fetchData();
  // }, [page]);

  // async function fetchData() {
  //   if (loaded && !inProgress) {
  //     inProgress = true;
  //     if (page > (prevPage || 0)) {
  //       const newValues = generateValues(
  //         await getNextValues(
  //           8,
  //           parseInt(currentValues[currentValues.length - 1].key as string),
  //           true
  //         ),
  //         'next'
  //       );
  //       setCurrentValues((prevState: JSX.Element[]) => {
  //         return [...prevState.slice(4, prevState.length), ...newValues];
  //       });
  //     } else {
  //       const newValues = generateValues(
  //         await getPreviousValues(8, parseInt(currentValues[0].key as string), true),
  //         'previous'
  //       );
  //       // scrollRef.current = currentValues[0];
  //       // document.getElementsByTagName("H1")[0].setAttribute("class", "democlass");
  //       // document.getElementById(currentValues[0].key as string)?.setAttribute('ref', );
  //       setCurrentValues((prevState: JSX.Element[]) => {
  //         return [...newValues, ...prevState.slice(0, prevState.length - 4)];
  //       });
  //       if (scrollRef.current) window.scrollTo(0, scrollRef.current.offsetTop);
  //     }
  //     setTimeout(() => {
  //       inProgress = false;
  //     }, 1000);
  //   }
  // }

  useEffect(() => {
    initialLoad();
  }, []);

  async function initialLoad() {
    const data = await getNextValues(100, -1);
    setCurrentValues(generateValues(data));
    setLoading(false);
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
    setWidth(window.innerWidth);
  }

  function generateValues(numbers: number[]) {
    const output = [];
    for (let i = 0; i < numbers.length; i++) {
      output.push(
        <div
          style={{
            paddingTop: 10,
            paddingBottom: 10,
            border: '1px solid black',
          }}
          key={numbers[i]}
        >
          <h1>{numbers[i]}</h1>
        </div>
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <EventClientHeader showNavigationWidth={SHOW_HEADER_NAVIGATION_WIDTH} />
      <div className={styles.body} style={{ height: height }}>
        {width > SHOW_HEADER_NAVIGATION_WIDTH && <MainNavigator currentTab="home" />}
        <div style={{ flex: 1, overflow: 'scroll' }}>
          <Loader
            numRendered={20}
            numUpdated={10}
            loading={false}
            getValues={() => {}}
            values={currentValues}
          />
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
