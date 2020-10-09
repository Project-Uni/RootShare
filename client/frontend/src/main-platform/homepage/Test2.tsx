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
for (let i = 0; i < 500; i++) {
  ALL_VALUES.push(i);
}

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
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

function TestComponent(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [width, setWidth] = useState(window.innerWidth);

  const [currentValues, setCurrentValues] = useState<JSX.Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastValue, setLastValue] = useState(0);

  useEffect(() => {
    initialLoad();
  }, []);

  async function initialLoad() {
    const data = await getNextValues(50, -1);
    setLastValue(data[data.length-1])
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

  async function getValues() {
    setLoading(true);
    const data = await getNextValues(50, lastValue, true)
    setLastValue(data[data.length-1])
    setCurrentValues([...currentValues, ...generateValues(data)]);
    setLoading(false);
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
            loading={loading}
            getValues={getValues}
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