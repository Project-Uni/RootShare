import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSText } from '../../base-components';
import { CircularProgress, TextFieldProps } from '@material-ui/core';
import {
  RSButton,
  RSLink,
  RSTextField,
} from '../../main-platform/reusable-components';
import { makeRequest } from '../../helpers/functions';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import Theme from '../../theme/Theme';
import GoogleButton from '../../hype-page/hype-registration/GoogleButton';
import LinkedInButton from '../../hype-page/hype-registration/LinkedInButton';
import { useHistory } from 'react-router-dom';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import qs from 'query-string';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    maxWidth: 500,
    width: '100%',
    textAlign: 'left',
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 30,
    paddingBottom: 30,
  },
  textBox: {
    marginBottom: 30,
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

type ServiceResponse = {
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

const Login = () => {
  const styles = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const accessToken = useSelector((state: RootshareReduxState) => state.accessToken);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const params = qs.parse(history.location.search);
  const redirectUrl = (params.redirect as string) || '/home';

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const textFieldProps: TextFieldProps = {
    variant: 'standard',
    error,
    onKeyDown: handleEnterCheck,
    className: styles.textBox,
    fullWidth: true,
  };

  function handleEnterCheck(event: any) {
    if (event.key === 'Enter') handleLogin();
  }

  async function handleLogin() {
    setLoading(true);
    const { data } = await makeRequest<ServiceResponse>(
      'POST',
      '/api/v2/auth/login',
      {
        email: email,
        password: password,
      }
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
      <RSTextField
        {...textFieldProps}
        label="E-MAIL"
        autoComplete="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        helperText={error ? 'Invalid login credentials' : ''}
      />
      <RSTextField
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
          {loading ? (
            <CircularProgress size={20} style={{ color: Theme.altText }} />
          ) : (
            'Login'
          )}
        </RSButton>
        <RSText color={Theme.secondaryText} className={styles.or} size={12}>
          or
        </RSText>
        <RSLink href={'/'} className={styles.link}>
          Sign-Up
        </RSLink>
      </div>
      <RSLink className={styles.link} href={'/account/forgotPassword'}>
        Forgot Password?
      </RSLink>
    </div>
  );
};
export default Login;
