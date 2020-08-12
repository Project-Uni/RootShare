import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar } from '@material-ui/core';
import RSText from '../../base-components/RSText';
import { Link } from 'react-router-dom';

import RootShareLogoWhite from '../../images/RootShareLogoWhite.png';

import { colors } from '../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  header: {
    marginBottom: '5px',
    background: colors.second,
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
              src={RootShareLogoWhite}
              alt="RootShare"
              className={styles.headerLogo}
            />
          </a>
        </div>
        <div className={styles.loginButton}>
          <Link to="../login" style={{ textDecoration: 'none' }}>
            <RSText type="head" size={15} color={colors.primaryText}>
              Login
            </RSText>
          </Link>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default LandingHead;
