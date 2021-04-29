import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar } from '@material-ui/core';

import { RSLogoWhite } from '../../images';

import Theme from '../../theme/Theme';
import { RSLink } from '../../main-platform/reusable-components';

const useStyles = makeStyles((_: any) => ({
  header: {
    marginBottom: '5px',
    background: Theme.bright,
    width: '100vw',
  },
  headerTitle: {
    flexGrow: 1,
    textAlign: 'left',
  },
  headerLogo: {
    color: 'white',
    height: '38px',
    width: '190px',
  },
}));

type Props = {};

function HypeHeader(props: Props) {
  const styles = useStyles();
  return (
    <AppBar position="static" className={styles.header}>
      <Toolbar>
        <div className={styles.headerTitle}>
          <RSLink href="/">
            <img src={RSLogoWhite} alt="RootShare" className={styles.headerLogo} />
          </RSLink>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default HypeHeader;
