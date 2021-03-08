import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

import HypeCard from '../hype-page/hype-card/HypeCard';

import Theme from '../theme/Theme';

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
    background: Theme.bright,
    color: 'white',
    '&:hover': {
      background: 'lightblue',
    },
  },
}));

type Props = {};

function ForgotPasswordCard(props: Props) {
  const styles = useStyles();
  const history = useHistory();

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
        backArrowAction={() => history.push('/login')}
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

export default ForgotPasswordCard;
