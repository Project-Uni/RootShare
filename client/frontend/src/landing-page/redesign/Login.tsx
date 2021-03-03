import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSText } from '../../base-components';
import { TextField} from '@material-ui/core';
import { RSButton, RSLink } from '../../main-platform/reusable-components';
import { makeRequest } from '../../helpers/functions';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import Theme from '../../theme/Theme';
import GoogleButton from '../../hype-page/hype-registration/GoogleButton';
import LinkedInButton from '../../hype-page/hype-registration/LinkedInButton';
import { useHistory } from 'react-router-dom';
import { RootshareReduxState } from '../../redux/store/stateManagement';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    height: window.innerHeight,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    flex: 1,
    display: 'flex',
    minHeight: '100%',
  },
  rightMiddleContent: {
    width:'500px',
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
  link: {
    color: Theme.bright,
    fontSize: '17px',
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

const MIN_WIDTH = 1000;

const Login = () => {
  const styles = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const accessToken = useSelector((state: RootshareReduxState) => state.accessToken);

  const [isMobile, setIsMobile] = useState(window.innerWidth < MIN_WIDTH);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const redirectUrl = '/home';

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.rightMiddleContent}>
        <TextField
          {...textFieldProps}
          label="E-MAIL"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          helperText={error ? 'Invalid login credentials' : ''}
        />
        <TextField
          {...textFieldProps}
          label="PASSWORD"
          autoComplete="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
        />

        {/* <div className={styles.externalWrapper}>
          <GoogleButton messageType={'login'} width={500} redirect={redirectUrl} />
        </div>
        <div className={styles.externalWrapper}>
          <LinkedInButton
          messageType={'login'}
          width={500}
          redirect={redirectUrl}
        />
        </div> */}
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
          <RSLink
            href={"/"}
            className={styles.link}
          >
            Sign-Up
          </RSLink>
        </div>
        <div className={styles.right}>
          <RSLink className={styles.link} href={'/account/forgotPassword'}>
            Forgot Password?
          </RSLink>
        </div>
      </div>
    </div>
  );
};
export default Login;