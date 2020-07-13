import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button, Link } from '@material-ui/core';
import { useLocation, Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../redux/actions/user';
import axios from 'axios';

import HypeCard from '../hype-page/hype-card/HypeCard';
import RSText from '../base-components/RSText';
import ForgotPasswordCard from './ForgotPasswordCard';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    height: window.innerHeight,
    width: window.innerWidth,
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
    background: 'rgb(30, 67, 201)',
    color: 'white',
    '&:hover': {
      background: 'lightblue',
    },
  },
}));

type Props = {
  user: { [key: string]: any };
  updateUser: (userInfo: { [key: string]: any }) => void;
};

function Login(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [redirectHome, setRedirectHome] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const [query, setQuery] = useQuery();
  const [redirectUrl, setRedirectUrl] = useState(query ? query[1] : '/');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await axios.get('/user/getCurrent');
    if (data['success'] === 1) {
      props.updateUser({ ...data['content'] });
      setRedirectHome(true);
    }
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
    const { data } = await axios.post('/auth/login/local', {
      email: email,
      password: password,
    });
    if (data['success'] === 1) {
      setError(false);
      props.updateUser({ ...data['content'] });
      setRedirectHome(true);
    } else {
      setError(true);
    }
    setLoading(false);
  }

  return (
    <div className={styles.wrapper}>
      {redirectHome && <Redirect to={redirectUrl} />}
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
          <Link href="#" onClick={() => setForgotPassword(true)}>
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
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
