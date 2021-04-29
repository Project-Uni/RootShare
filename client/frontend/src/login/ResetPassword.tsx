import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';
import { TextField, Button } from '@material-ui/core';

import axios from 'axios';
import { connect } from 'react-redux';
import { updateUser } from '../redux/actions/user';

import { RSLink } from '../main-platform/reusable-components';
import HypeCard from '../hype-page/hype-card/HypeCard';
import RSText from '../base-components/RSText';

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
    height: 40,
    background: Theme.bright,
    color: 'white',
    '&:hover': {
      background: 'lightblue',
    },
  },
  confirmation: {
    marginTop: 15,
    color: Theme.secondaryText,
  },
  link: {
    paddingTop: 10,
  },
}));

type Props = {
  updateUser: (userInfo: { [key: string]: any }) => void;
};

function ResetPassword(props: Props) {
  const styles = useStyles();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordReset, setPasswordReset] = useState('');

  const { emailtoken: emailToken } = useParams<{ emailtoken: string }>();

  useEffect(() => {}, []);

  function handleNewPasswordChange(event: any) {
    setNewPassword(event.target.value);
  }

  function handleConfirmPasswordChange(event: any) {
    setConfirmPassword(event.target.value);
  }

  function handleEnterCheck(event: any) {
    if (event.key === 'Enter') handleUpdatePassword();
  }

  async function handleUpdatePassword() {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    const { data } = await axios.post('/auth/updatePassword', {
      emailToken,
      newPassword,
    });
    if (data['success'] === 1) {
      setError('');
      setPasswordReset('Password was successfully changed!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(data['message']);
    }
    setLoading(false);
  }

  return (
    <div className={styles.wrapper}>
      <HypeCard width={375} loading={loading} headerText="Reset Password">
        <TextField
          variant="outlined"
          error={error !== ''}
          label="New Password"
          autoComplete="new-password"
          onChange={handleNewPasswordChange}
          onKeyDown={handleEnterCheck}
          value={newPassword}
          type="password"
          className={styles.textField}
        />
        <TextField
          variant="outlined"
          error={error !== ''}
          label="Confirm Password"
          autoComplete="new-password"
          onChange={handleConfirmPasswordChange}
          onKeyDown={handleEnterCheck}
          value={confirmPassword}
          type="password"
          className={styles.textField}
          helperText={error !== '' ? error : ''}
        />
        <Button
          variant="contained"
          onClick={handleUpdatePassword}
          className={styles.button}
          disabled={loading}
        >
          Reset Password
        </Button>
        {passwordReset === '' ? (
          <span />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <RSText size={12} className={styles.confirmation}>
              {passwordReset}
            </RSText>
            <RSLink href="/login" className={styles.link} underline="hover">
              <RSText>Back to Login</RSText>
            </RSLink>
          </div>
        )}
      </HypeCard>
    </div>
  );
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

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
