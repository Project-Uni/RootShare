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
  goBackToLogin: () => void;
};

function Login(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [linkSent, setLinkSent] = useState('');

  useEffect(() => {}, []);

  function handleEmailChange(event: any) {
    setEmail(event.target.value);
  }
  function handleEnterCheck(event: any) {
    if (event.key === 'Enter') handleForgotPassword();
  }

  async function handleForgotPassword() {
    setLoading(true);
    const { data } = await axios.post('/auth/sendPasswordReset', {
      email: email,
    });
    if (data['success'] === 1) {
      setError('');
      setLinkSent('Password reset link was sent to your email');
    } else {
      setError(`Can't reset password for this email`);
    }
    setLoading(false);
  }

  return (
    <div className={styles.wrapper}>
      <HypeCard
        width={375}
        loading={loading}
        headerText="Reset Password"
        backArrow="action"
        backArrowAction={() => props.goBackToLogin()}
      >
        <TextField
          variant="outlined"
          error={error !== ''}
          label="Email"
          autoComplete="email"
          onChange={handleEmailChange}
          onKeyDown={handleEnterCheck}
          value={email}
          className={styles.textField}
          helperText={error !== '' ? error : linkSent !== '' ? linkSent : ''}
        />
        <Button
          variant="contained"
          onClick={handleForgotPassword}
          className={styles.button}
          disabled={loading}
        >
          Send Reset Link
        </Button>
      </HypeCard>
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
