import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useDispatch, useSelector } from 'react-redux';

import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import { Link } from 'react-router-dom';

import { RSText } from '../../base-components';
import Login from './Login';
import { SignupForm } from './registration/SignupForm';
import { VerifyPhone } from './verification/VerifyPhone';
import { AccountInitializationForm } from './initialization/AccountInitializationForm';

import Theme from '../../theme/Theme';
import { useHistory } from 'react-router-dom';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import {
  RSLogoFull,
  LandingBullets,
  HorizontalLine,
  VerticalLine,
} from '../../images';

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
  socialLinks: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 15,
  },
  icon: {
    fontSize: 35,
    paddingRight: 20,
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

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  //TODO - Update with components
  const getLeftComponent = useCallback(
    (onlyText?: boolean) => {
      switch (mode) {
        case 'register':
          if (onlyText) return 'Sign Up';
          return (
            // <LeftGraphic title="Sign Up" />
            <div>
              <RSText className={styles.title} color={Theme.white} size={40}>
                Sign Up
              </RSText>
              <img src={LandingBullets} />
            </div>
          );
        case 'login':
          if (onlyText) return 'Login';
          return (
            <div>
              <RSText className={styles.title} color={Theme.white} size={40}>
                Login
              </RSText>
              <img src={LandingBullets} />
            </div>
          );
        case 'additional':
          if (onlyText) return 'Complete Registration';
          return (
            // <LeftGraphic title="Sign Up" />
            <div>
              <RSText className={styles.title} color={Theme.white} size={40}>
                Complete Registration
              </RSText>
              <img src={LandingBullets} />
            </div>
          );
        case 'verify':
          if (onlyText) return 'Verify Account';
          return (
            // <LeftGraphic title="Sign Up" />
            <div>
              <RSText className={styles.title} color={Theme.white} size={40}>
                Verify Account
              </RSText>
              <img src={LandingBullets} />
            </div>
          );
      }
    },
    [mode]
  );

  //Moved RightComponent below to prevent Textfield re-render
  const getRightComponent = useCallback(() => {
    switch (mode) {
      case 'register':
        return <SignupForm />;
      case 'verify':
        return <VerifyPhone />;
      case 'login':
        return <Login />;
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
          {/* {isMobile && (
            <div className={styles.leftMiddleContent}>{getLeftComponent()}</div>
          )} */}

          <img src={RSLogoFull} className={styles.logo} />
          {!isMobile && (
            <RSText color={Theme.white} size={20}>
              Lets Grow Together
            </RSText>
          )}
          <div className={styles.socialLinks}>
            <a href="https://twitter.com/root_share" target="_blank">
              <TwitterIcon htmlColor={'#222222'} className={styles.icon} />
            </a>
            <a href="https://www.facebook.com/rootshareplatform" target="_blank">
              <FacebookIcon htmlColor={'#222222'} className={styles.icon} />
            </a>
            <a href="https://www.instagram.com/rootshare/" target="_blank">
              <InstagramIcon htmlColor={'#222222'} className={styles.icon} />
            </a>
            {/* <RSLink>
              <RSText size={14} weight="bold">
                Privacy Policy
              </RSText>
            </RSLink> */}
          </div>
          {isMobile && (
            <RSText size={24} color={Theme.altText}>
              {getLeftComponent(true)}
            </RSText>
          )}
        </div>
      </div>
      <div className={styles.rightMiddleContent}>{getRightComponent()}</div>
    </div>
  );
};
export default LandingPage;

const LeftGraphic = ({ title, mobile }: { title: string; mobile?: boolean }) => {
  const styles = useStyles();

  return (
    <div>
      <RSText className={styles.title} color={Theme.white} size={40}>
        {title}
      </RSText>
      <div style={{ display: mobile ? undefined : 'flex' }}>
        <img
          src={mobile ? HorizontalLine : VerticalLine}
          style={{ height: mobile ? undefined : 500 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: mobile ? 'row' : 'column',
            justifyContent: 'space-between',
          }}
        >
          <RSText color={Theme.altText}>
            Build community to community relationships
          </RSText>
          <RSText color={Theme.altText}>Connect Students & Alumni</RSText>
          <RSText color={Theme.altText}>Live Your university online</RSText>
        </div>
      </div>
      {/* <img src={LandingImg} /> */}
    </div>
  );
};
