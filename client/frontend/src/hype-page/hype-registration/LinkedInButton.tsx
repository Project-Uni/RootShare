import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import linkedInLogo from '../../images/linkedIn.png';

const LOGIN_MESSAGE = 'Login with LinkedIn';
const SIGNUP_MESSAGE = 'Sign up with LinkedIn';

const useStyles = makeStyles((theme) => ({
  linkedinPaper: {
    display: 'flex',
    alignItems: 'center',
    height: '50px',
    backgroundColor: 'rgb(14, 118, 168)',
    '&:hover': {
      backgroundColor: 'rgb(12, 93, 133)',
    },
  },
  linkedinText: {
    display: 'inline-block',
    flex: 1,
    fontFamily: 'Arial',
    color: 'white',
    fontWeight: 'bold',
  },
  linkedinLink: {
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
  logoStyle: {
    width: '35px',
    height: '35px',
    marginLeft: '7px',
  },
}));

type Props = {
  messageType: 'login' | 'signup';
  width?: number;
};

export default function LinkedInButton(props: Props) {
  const styles = useStyles();

  return (
    <Paper
      className={styles.linkedinPaper}
      elevation={3}
      style={{ width: props.width || 250 }}
    >
      <a href="/auth/login/linkedin" className={styles.linkedinLink}>
        <img src={linkedInLogo} alt="Google logo" className={styles.logoStyle} />

        <p className={styles.linkedinText}>
          {props.messageType === 'login' ? LOGIN_MESSAGE : SIGNUP_MESSAGE}
        </p>
      </a>
    </Paper>
  );
}
