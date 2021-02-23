import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RootShareLogo from '../../images/RootShareLogoFull.png';
import LandingImg from '../../images/landingBullets.png';
import { RSText } from '../../base-components';
import { TextField, Link } from '@material-ui/core';
import { RSButton } from '../../main-platform/reusable-components';
import { makeRequest } from '../../helpers/functions';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import Theme from '../../theme/Theme';
import GoogleButton from '../../hype-page/hype-registration/GoogleButton';
import LinkedInButton from '../../hype-page/hype-registration/LinkedInButton';
import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { trace } from 'console';

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
    alignItems: 'left',
    marginTop: '20%',
    marginBottom: '50px',
  },
  leftTitle: {
    padding: '50px',
    marginLeft: '-40%',
  },
  leftImg: {
    marginLeft: '50px',
  },
  right: {
    flex: 1,
    display: 'flex',
    minHeight: '100%',
  },
  rightMiddleContent: {
    height: '100%',
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox:{
    width: 500,
    marginBottom: '20px',
  },
  externalWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
  },
  or: {
    marginLeft: '5px',
    marginRight: '5px',
  },
  button: {
    width: 80,
    marginTop: 20,
    marginBottom: 20,
    height: 40,
    background: Theme.bright,
    color: Theme.white,
    '&:hover': {
      background: Theme.brightHover,
    },
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
  mode: 'register' | 'login' | 'additional';
};

const LandingPage = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const accessToken = useSelector((state: RootshareReduxState) => state.accessToken);

  const { mode } = props;
  const [isMobile, setIsMobile] = useState(window.innerWidth < MIN_WIDTH);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  // const values = queryString.parse(props.location.search);
  const redirectUrl = '/home';
  // const accessTokenParam = values.accessToken as string;
  // const refreshTokenParam = values.refreshToken as string;

  const handleResize = () => {
    if (window.innerWidth < MIN_WIDTH && !isMobile) setIsMobile(true);
    else if (window.innerWidth >= MIN_WIDTH && isMobile) setIsMobile(false);
  };

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const textFieldProps: any = {
    variant: 'standard',
    error,
    onKeyDown: handleEnterCheck,
    className: styles.textBox,
  };

  function handleEnterCheck(event: any) {
    if (event.key === 'Enter') handleLogin();
  }

  async function handleLogin() {
    setLoading(true);
    const { data } = await makeRequest('POST', '/api/v2/auth/login', {
      email: email,
      password: password,
    });
    if (data['success'] === 1) {
      setError(false);
      const {
        firstName,
        lastName,
        _id,
        email,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        privilegeLevel,
        accountType,
        profilePicture,
      } = data['content'];
      dispatch(
        updateUser({
          firstName,
          lastName,
          _id,
          email,
          privilegeLevel,
          accountType,
          profilePicture,
          profilePictureLastUpdated: profilePicture ? Date.now() : undefined,
        })
      );
      dispatch(updateAccessToken(newAccessToken));
      dispatch(updateRefreshToken(newRefreshToken));
      history.push(redirectUrl);
    } else {
      setError(true);
    }
    setLoading(false);
  }

  //TODO - Update with components
  const getLeftComponent = useCallback(() => {
    switch (mode) {
      case 'register':
        return (
          <div>
            <RSText className={styles.leftTitle} color={Theme.white} size={40}>
              Sign Up
            </RSText>
            <img className={styles.leftImg} src={LandingImg} />
          </div>
        );
      case 'login':
        return (
          <div>
            <RSText className={styles.leftTitle} color={Theme.white} size={40}>
              Login
            </RSText>
            <img className={styles.leftImg} src={LandingImg} />
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
        return (
          <p>Additional Info Form and Buttons</p>
      )
      case 'login':
        return (
          <p>Additional Info Form and Buttons</p>
        )
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
            <div className={styles.leftMiddleContent}>{getLeftComponent()}</div>
          )}

          <img src={RootShareLogo} className={styles.logo} />
          <RSText color={Theme.white} size={20}>
            Lets Grow Together
          </RSText>
        </div>
      </div>
      <div className={styles.right}>
        {mode === 'register' && ( 
          <div className={styles.rightMiddleContent}>
          <table>
            <tr>
            <TextField
              // {...textFieldProps}
              label="E-MAIL"
              autoComplete="email"
              className={styles.textBox}
              // onChange={(e) => setEmail(e.target.value)}
              // value={email}
              // helperText={error ? 'Invalid login credentials' : ''}
            />
          </tr>
          <tr>
              <TextField
                // {...textFieldProps}
                label="PHONE NUMBER"
                autoComplete="phone"
                className={styles.textBox}
                // onChange={(e) => setEmail(e.target.value)}
                // value={email}
                // helperText={error ? 'Invalid login credentials' : ''}
              />
            </tr>
          <tr>
            <TextField
              // {...textFieldProps}
              label="PASSWORD"
              autoComplete="password"
              className={styles.textBox}
              // onChange={(e) => setPassword(e.target.value)}
              // value={password}
              // type="password"
            />
          </tr>
          <tr>
              <TextField
                // {...textFieldProps}
                label="REPEAT PASSWORD"
                autoComplete="repeat password"
                className={styles.textBox}
                // onChange={(e) => setEmail(e.target.value)}
                // value={email}
                // helperText={error ? 'Invalid login credentials' : ''}
              />
            </tr>
          <tr>
            <div className={styles.externalWrapper}>
              <GoogleButton messageType={'signup'} width={500} redirect={redirectUrl} />
            </div>
          </tr>
          <tr>
            <div className={styles.externalWrapper}>
              <LinkedInButton
                messageType={'signup'}
                width={500}
                redirect={redirectUrl}
              />
            </div>
          </tr>
          <tr>
            <div className={styles.buttonContainer}>
              <RSText color={Theme.secondaryText} className={styles.or} size={12}>
                By clicking sign-up you agree to our
              </RSText>
              <Link
                href={""}
                className={styles.link}
              >
                terms and conditions
              </Link>
              <RSText color={Theme.secondaryText} size={12}>
                .
              </RSText>
            </div>
          </tr>
          <tr>
            <div className={styles.buttonContainer}>
              <RSButton
                // variant="contained"
                // onClick={handleLogin}
                className={styles.button}
                // disabled={loading}
              >
                Sign-Up
              </RSButton>
              <RSText color={Theme.secondaryText} className={styles.or} size={12}>
                or
              </RSText>
              <Link
                href={"/login"}
                className={styles.link}
              >
                Login
              </Link>
            </div>
          </tr>
          </table>
        </div>
        )}
        {mode === 'login' && (
          <div className={styles.rightMiddleContent}>
          <table>
          <tr>
            <TextField
              {...textFieldProps}
              label="E-MAIL"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              helperText={error ? 'Invalid login credentials' : ''}
            />
          </tr>
          <tr>
            <TextField
              {...textFieldProps}
              label="PASSWORD"
              autoComplete="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
            />
          </tr>
          <tr>
            <div className={styles.externalWrapper}>
              <GoogleButton messageType={'login'} width={500} redirect={redirectUrl} />
            </div>
          </tr>
          <tr>
            <div className={styles.externalWrapper}>
              <LinkedInButton
                messageType={'login'}
                width={500}
                redirect={redirectUrl}
              />
            </div>
          </tr>
          <tr>
            <div className={styles.buttonContainer}>
              <RSButton
                variant="primary"
                onClick={handleLogin}
                className={styles.button}
                disabled={loading}
              >
                Login
              </RSButton>
              <RSText color={Theme.secondaryText} className={styles.or} size={12}>
                or
              </RSText>
              <Link
                href={"/"}
                className={styles.link}
              >
                Sign-Up
              </Link>
            </div>
          </tr>
          <tr>
            <div className={styles.right}>
            <Link
              href={undefined}
              className={styles.link}
              onClick={() => setForgotPassword(true)}
            >
              Forgot Password?
            </Link>
            </div>
          </tr>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
export default LandingPage;
