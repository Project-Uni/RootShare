import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RootShareLogo from '../../images/RootShareLogoFull.png';
import { RSText } from '../../base-components';
import Theme from '../../theme/Theme';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../redux/store/stateManagement';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    minHeight: '100vh',
  },
  left: {
    background: `linear-gradient(45deg, #555555, #61C87F);`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  leftMiddleContent: {
    height: '100%',
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  logo: {
    width: 300,
  },
}));

const MIN_WIDTH = 915;

type Props = {
  mode: 'register' | 'login' | 'additional';
};

const LandingPage = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();

  const accessToken = useSelector((state: RootshareReduxState) => state.accessToken);

  const { mode } = props;
  const [isMobile, setIsMobile] = useState(window.innerWidth < MIN_WIDTH);

  const handleResize = () => {
    if (window.innerWidth < MIN_WIDTH && !isMobile) setIsMobile(true);
    else if (window.innerWidth >= MIN_WIDTH && isMobile) setIsMobile(false);
  };

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
  }, [accessToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  //TODO - Update with components
  const getLeftComponent = useCallback(() => {
    switch (mode) {
      case 'register':
        return <p>Register Left Component</p>;
      case 'login':
        return <p>Login Left Component</p>;
      case 'additional':
        return <p>Additional Info Left Component</p>;
    }
  }, [mode]);

  //TODO - Update with components
  const getRightComponent = useCallback(() => {
    switch (mode) {
      case 'register':
        return <p>Register Form and Buttons</p>;
      case 'login':
        return <p>Login Form and Buttons</p>;
      case 'additional':
        return <p>Additional Info Form and Buttons</p>;
    }
  }, [mode]);

  return (
    <div
      className={styles.wrapper}
      style={{
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'flex-start',
        display: 'flex',
      }}
    >
      <div
        className={styles.left}
        style={{
          width: isMobile ? '100%' : '40%',
        }}
      >
        {!isMobile && (
          <div className={styles.leftMiddleContent}>{getLeftComponent()}</div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'center' : 'flex-start',
            justifyContent: isMobile ? 'center' : undefined,
            marginLeft: 50,
            marginBottom: 50,
          }}
        >
          {/* TODO - Fix styling to match wireframe */}
          {isMobile && (
            <RSText color={Theme.white} size={20}>
              Sign Up
            </RSText>
          )}
          <img src={RootShareLogo} className={styles.logo} />
          <RSText color={Theme.white} size={20}>
            Lets Grow Together
          </RSText>
        </div>
      </div>
      <div className={styles.right}>{getRightComponent()}</div>
    </div>
  );
};
export default LandingPage;
