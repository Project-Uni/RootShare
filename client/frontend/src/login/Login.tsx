import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button, Link } from '@material-ui/core';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';

import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../redux/actions/token';
import { makeRequest } from '../helpers/functions';

import HypeCard from '../hype-page/hype-card/HypeCard';
import ForgotPasswordCard from './ForgotPasswordCard';
import GoogleButton from '../hype-page/hype-registration/GoogleButton';
import LinkedInButton from '../hype-page/hype-registration/LinkedInButton';
import Theme from '../theme/Theme';
import { RootshareReduxState } from '../redux/store/stateManagement';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    height: window.innerHeight,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textField: {
    width: 300,
    marginTop: 25,
  },
  button: {
    width: 300,
    marginTop: 20,
    marginBottom: 20,
    height: 40,
    background: Theme.bright,
    color: Theme.white,
    '&:hover': {
      background: Theme.brightHover,
    },
  },
  forgotPassword: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  externalWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 10,
  },
}));

type Props = {
  location: any;
};

type LoginServiceResponse = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    _id: string;
    accountType: string;
    privilegeLevel: number;
    profilePicture?: string;
  };
  accessToken: string;
  refreshToken: string;
};

function Login(props: Props) {
  const styles = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const values = queryString.parse(props.location.search);
  const redirectUrl = (values.redirect as string) || '/home';
  const accessTokenParam = values.accessToken as string;
  const refreshTokenParam = values.refreshToken as string;

  const accessToken = useSelector((state: RootshareReduxState) => state.accessToken);

  useEffect(() => {
    checkAuth();
  }, [accessToken]);

  const textFieldProps: any = {
    variant: 'outlined',
    error,
    onKeyDown: handleEnterCheck,
    className: styles.textField,
  };

  async function checkAuth() {
    setLoading(true);
    if (accessTokenParam) dispatch(updateAccessToken(accessTokenParam));
    if (refreshTokenParam) dispatch(updateRefreshToken(refreshTokenParam));
    if (accessToken) history.push(redirectUrl);
    setLoading(false);
  }

  function handleEnterCheck(event: any) {
    if (event.key === 'Enter') handleLogin();
  }

  async function handleLogin() {
    setLoading(true);
    const { data } = await makeRequest<LoginServiceResponse>(
      'POST',
      '/api/v2/auth/login',
      { email, password }
    );
    if (data['success'] === 1) {
      setError(false);
      const {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = data['content'];
      dispatch(
        updateUser({
          ...user,
          profilePictureLastUpdated: user.profilePicture ? Date.now() : undefined,
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
      {forgotPassword ? (
        <ForgotPasswordCard goBackToLogin={() => setForgotPassword(false)} />
      ) : (
        <HypeCard width={375} loading={loading} headerText="Login">
          <TextField
            {...textFieldProps}
            label="Email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            helperText={error ? 'Invalid login credentials' : ''}
          />
          <TextField
            {...textFieldProps}
            label="Password"
            autoComplete="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
          />
          <Button
            variant="contained"
            onClick={handleLogin}
            className={styles.button}
            disabled={loading}
          >
            Login
          </Button>
          <div className={styles.externalWrapper}>
            <GoogleButton messageType={'login'} width={300} redirect={redirectUrl} />
          </div>
          <div className={styles.externalWrapper}>
            <LinkedInButton
              messageType={'login'}
              width={300}
              redirect={redirectUrl}
            />
          </div>
          <Link
            href={undefined}
            className={styles.forgotPassword}
            onClick={() => setForgotPassword(true)}
          >
            Forgot Password?
          </Link>
        </HypeCard>
      )}
    </div>
  );
}

export default Login;
