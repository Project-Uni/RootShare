import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import {
  updateRefreshToken,
  updateAccessToken,
  updateUser,
} from '../../redux/actions';

import Login from './Login';
import { SignupForm } from './registration/SignupForm';
import { VerifyPhone } from './verification/VerifyPhone';
import { AccountInitializationForm } from './initialization/AccountInitializationForm';
import RootShareLogo from '../../images/RootShareLogoFull.png';
import LandingImg from '../../images/landingBullets.png';
import { RSText } from '../../base-components';

import Theme from '../../theme/Theme';
import { makeRequest } from '../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    minHeight: '100vh',
  },
  left: {
    background: `linear-gradient(45deg, #555555, #61C87F);`,
    boxShadow: '6px 0px 23px rgba(0, 0, 0, 0.3)',
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
  title: {
    textAlign: 'left',
    marginBottom: '50px',
  },
  rightMiddleContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  logo: {
    width: 300,
  },
  link: {
    color: Theme.bright,
    fontSize: '17px',
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

const MIN_WIDTH = 1000;

type Props = {
  mode: 'register' | 'login' | 'additional' | 'verify';
};

const LandingPage = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

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

  useEffect(() => {
    temp();
  });

  async function temp() {
    const { data } = await makeRequest('POST', '/api/v2/auth/login', {
      email: 'smitdesai422@gmail.com',
      password: 'password2',
    });
    const {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } = data['content'];
    dispatch(
      updateUser({
        ...user,
      })
    );
    dispatch(updateAccessToken(newAccessToken));
    dispatch(updateRefreshToken(newRefreshToken));
    history.push('/home');
  }

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  //TODO - Update with components
  const getLeftComponent = useCallback(() => {
    switch (mode) {
      case 'register':
        return (
          <div>
            <RSText className={styles.title} color={Theme.white} size={40}>
              Sign Up
            </RSText>
            <img src={LandingImg} />
          </div>
        );
      case 'login':
        return (
          <div>
            <RSText className={styles.title} color={Theme.white} size={40}>
              Login
            </RSText>
            <img src={LandingImg} />
          </div>
        );
      case 'additional':
        return <p>Additional Info Left Component</p>;
    }
  }, [mode]);

  //Moved RightComponent below to prevent Textfeild re-render
  const getRightComponent = useCallback(() => {
    switch (mode) {
      case 'register':
        return <SignupForm />;
      case 'verify':
        return <VerifyPhone />;
      case 'login':
        return (
          <div className={styles.rightMiddleContent}>
            <Login />
          </div>
        );
      case 'additional':
        return <AccountInitializationForm />;
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
            <div className={styles.leftMiddleContent}>{getLeftComponent()}</div>
          )}

          <img src={RootShareLogo} className={styles.logo} />
          <RSText color={Theme.white} size={20}>
            Lets Grow Together
          </RSText>
        </div>
      </div>
      <div className={styles.rightMiddleContent}>
        <div> {getRightComponent()}</div>
      </div>
    </div>
  );
};
export default LandingPage;
