import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import googleLogo from '../../images/google.svg';

const LOGIN_MESSAGE = 'Login with Google';
const SIGNUP_MESSAGE = 'Sign up with Google';

const useStyles = makeStyles((theme) => ({
  googlePaper: {
    display: 'flex',
    alignItems: 'center',
    height: '50px',
    backgroundColor: '#FFFFFF',
    '&:hover': {
      backgroundColor: 'rgb(230,230,230)',
    },
  },
  googleText: {
    display: 'inline-block',
    flex: 1,
    fontFamily: 'Roboto',
    color: '#707070',
  },
  googleLink: {
    display: 'flex',
    textDecoration: 'none',
    width: '100%',
    height: '100%',
    '&:visited': {
      color: 'inherit',
    },
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

type Props = {
  messageType: 'login' | 'signup';
  width?: number;
  redirect?: string;
};

export default function GoogleButton(props: Props) {
  const styles = useStyles();

  let queryString = '/auth/login/google';
  if (props.redirect) queryString = `${queryString}?redirect=${props.redirect}`;

  return (
    <Paper
      className={styles.googlePaper}
      elevation={3}
      style={{ width: props.width || 250 }}
    >
      <a href={queryString} className={styles.googleLink}>
        <img src={googleLogo} alt="Google logo" />
        <p className={styles.googleText}>
          {props.messageType === 'login' ? LOGIN_MESSAGE : SIGNUP_MESSAGE}
        </p>
      </a>
    </Paper>
  );
}
