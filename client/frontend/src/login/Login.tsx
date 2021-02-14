import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button, Link } from '@material-ui/core';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { updateUser } from '../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../redux/actions/token';
import { makeRequest } from '../helpers/functions';

import HypeCard from '../hype-page/hype-card/HypeCard';
import ForgotPasswordCard from './ForgotPasswordCard';
import GoogleButton from '../hype-page/hype-registration/GoogleButton';
import LinkedInButton from '../hype-page/hype-registration/LinkedInButton';
import { colors } from '../theme/Colors';
import Theme from '../theme/Theme';

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
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;

  location: any;
};

// TODO - Set up login, signup and reset password to work with chrome’s credential standards
function Login(props: Props) {
  const styles = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const values = queryString.parse(props.location.search);
  const redirectUrl = (values.redirect as string) || '/home';
  const accessToken = values.accessToken as string;
  const refreshToken = values.refreshToken as string;

  useEffect(() => {
    checkAuth();
  }, [props.accessToken]);

  async function checkAuth() {
    setLoading(true);
    if (accessToken) props.updateAccessToken(accessToken);
    if (refreshToken) props.updateRefreshToken(refreshToken);
    if (props.accessToken) history.push(redirectUrl);
    setLoading(false);
  }

  function handleEmailChange(event: any) {
    setEmail(event.target.value);
  }
  function handlePasswordChange(event: any) {
    setPassword(event.target.value);
  }
  function handleEnterCheck(event: any) {
    if (event.key === 'Enter') handleLogin();
  }

  async function handleLogin() {
    setLoading(true);
    const { data } = await makeRequest('POST', '/auth/login/local', {
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
        accessToken,
        refreshToken,
        privilegeLevel,
        accountType,
        profilePicture,
      } = data['content'];
      props.updateUser({
        firstName,
        lastName,
        _id,
        email,
        privilegeLevel,
        accountType,
        profilePicture,
      });
      props.updateAccessToken(accessToken);
      props.updateRefreshToken(refreshToken);
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
            variant="outlined"
            error={error}
            label="Email"
            autoComplete="email"
            onChange={handleEmailChange}
            onKeyDown={handleEnterCheck}
            value={email}
            className={styles.textField}
            helperText={error ? 'Invalid login credentials' : ''}
          />
          <TextField
            variant="outlined"
            error={error}
            label="Password"
            autoComplete="password"
            onChange={handlePasswordChange}
            onKeyDown={handleEnterCheck}
            value={password}
            type="password"
            className={styles.textField}
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
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

export default connect(mapStateToProps, mapDispatchToProps)(Login);
