import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar } from '@material-ui/core';
import RootShareLogoWhite from '../../../../images/RootShareLogoWhite.png';

import { colors } from '../../../../theme/Colors';
import { RSLink } from '../../../../main-platform/reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: { width: '100%' },
  header: {
    background: colors.secondary,
  },
  headerLogo: {
    height: '30px',
    width: '150px',
  },
  icons: {},
  iconStyle: {},
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

type Props = {
  minWidth?: number;
  showNavigationWidth?: number;
};

function EventMobileHeader(props: Props) {
  const styles = useStyles();

  const minWidth = props.minWidth || 100;
  const [width, setWidth] = useState(
    window.innerWidth >= minWidth ? window.innerWidth : props.minWidth
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    if (window.innerWidth >= minWidth) setWidth(window.innerWidth);
  }

  return (
    <div className={styles.wrapper} style={{ width: width, minWidth: minWidth }}>
      <AppBar position="static" className={styles.header}>
        <Toolbar className={styles.toolbar}>
          <RSLink href="/">
            <img
              src={RootShareLogoWhite}
              alt="RootShare"
              className={styles.headerLogo}
            />
          </RSLink>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default EventMobileHeader;
