import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar } from '@material-ui/core';
import RSText from '../../base-components/RSText';
import { Link } from 'react-router-dom';

import RootShareLogo from '../../images/RootShareLogoFull.png';

import { colors } from '../../theme/Colors';
import Theme from '../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  header: {
    marginBottom: '5px',
    background: Theme.primary,
    width: '100vw',
    minWidth: 450,
  },
  headerTitle: {
    flexGrow: 1,
    textAlign: 'left',
  },
  loginButton: {
    flexGrow: 1,
    textAlign: 'right',
  },
  headerLogo: {
    color: 'white',
    height: '38px',
    width: '190px',
  },
}));

type Props = {};

function LandingHead(props: Props) {
  const styles = useStyles();
  return (
    <AppBar position="static" className={styles.header}>
      <Toolbar>
        <div className={styles.headerTitle}>
          <a href="/">
            <img
              src={RootShareLogo}
              alt="RootShare"
              className={styles.headerLogo}
            />
          </a>
        </div>
        <div className={styles.loginButton}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <RSText type="subhead" size={15} color={Theme.white}>
              Login
            </RSText>
          </Link>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default LandingHead;
