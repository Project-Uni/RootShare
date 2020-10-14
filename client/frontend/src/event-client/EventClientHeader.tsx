import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton } from '@material-ui/core';
import RootShareLogoWhite from '../images/RootShareLogoWhite.png';

import { MdGroupAdd, MdAccountCircle, MdMenu } from 'react-icons/md';
import { IoMdText } from 'react-icons/io';
import { FaRegCalendarAlt } from 'react-icons/fa';

import EventDrawer from './EventDrawer';

import { colors } from '../theme/Colors';

import {
  CalendarDrawer,
  ConnectionsDrawer,
  MessagesDrawerContainer,
  ProfileDrawer,
  NavigationDrawer,
} from './drawer-components';
import { checkDesktop } from '../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  header: {
    background: colors.second,
  },
  headerLogo: {},
  icons: {},
  iconStyle: {},
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  alpha: {
    marginLeft: 5,
  },
}));

type Props = {
  minWidth?: number;
  showNavigationWidth?: number;
  showNavigationMenuDefault?: boolean;
};

function EventClientHeader(props: Props) {
  const styles = useStyles();
  const [drawerContent, setDrawerContent] = useState('');
  const [drawerAnchor, setDrawerAnchor] = useState<'left' | 'right'>('right');
  const minWidth = props.minWidth || 100;
  const [width, setWidth] = useState(
    window.innerWidth >= minWidth ? window.innerWidth : props.minWidth
  );

  const isDesktop = checkDesktop();
  const iconSize = isDesktop ? 32 : 24;

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    if (window.innerWidth >= minWidth) setWidth(window.innerWidth);
  }

  function handleDrawerClose() {
    setDrawerContent('');
  }

  function handleConnectionsClick() {
    setDrawerAnchor('right');
    setDrawerContent('connections');
  }

  function handleMessagesClick() {
    setDrawerAnchor('right');
    setDrawerContent('messages');
  }

  function handleCalendarClick() {
    setDrawerAnchor('right');
    setDrawerContent('calendar');
  }

  function handleProfileClick() {
    setDrawerAnchor('right');
    setDrawerContent('profile');
  }

  function handleNavigationClick() {
    setDrawerAnchor('left');
    setDrawerContent('navigation');
  }

  function getDrawerContent() {
    switch (drawerContent) {
      case 'connections':
        return <ConnectionsDrawer />;
      case 'calendar':
        return <CalendarDrawer />;
      case 'messages':
        return <MessagesDrawerContainer />;
      case 'profile':
        return <ProfileDrawer />;
      case 'navigation':
        return <NavigationDrawer currentTab="none" />;
      default:
        return null;
    }
  }

  function renderIcons() {
    return (
      <>
        <IconButton className={styles.iconStyle} onClick={handleConnectionsClick}>
          <MdGroupAdd size={iconSize} color={colors.primaryText} />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleMessagesClick}>
          <IoMdText size={iconSize} color={colors.primaryText} />
        </IconButton>
        {/* <IconButton className={styles.iconStyle} onClick={handleCalendarClick}>
          <FaRegCalendarAlt size={isDesktop ? 27 : 20} color={colors.primaryText} />
        </IconButton> */}
        <IconButton className={styles.iconStyle} onClick={handleProfileClick}>
          <MdAccountCircle color={colors.primaryText} size={iconSize} />
        </IconButton>
      </>
    );
  }

  return (
    <div className={styles.wrapper} style={{ width: width, minWidth: minWidth }}>
      <AppBar position="static" className={styles.header}>
        <Toolbar className={styles.toolbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(props.showNavigationMenuDefault ||
              (props.showNavigationWidth &&
                window.innerWidth < props.showNavigationWidth)) && (
              <IconButton onClick={handleNavigationClick}>
                <MdMenu color={colors.primaryText} size={28} />
              </IconButton>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <a href="/home">
                <img
                  src={RootShareLogoWhite}
                  alt="RootShare"
                  className={styles.headerLogo}
                  style={{
                    height: isDesktop ? 38 : 25,
                    width: isDesktop ? 190 : 130,
                  }}
                />
              </a>
              {/* <img
                src={AlphaLogo}
                alt="Alpha"
                className={styles.alpha}
                style={{ height: isDesktop ? 24 : 16 }}
              /> */}
            </div>
          </div>

          <div className={styles.icons}>{isDesktop && renderIcons()}</div>
        </Toolbar>
        <EventDrawer
          open={Boolean(drawerContent)}
          handleClose={handleDrawerClose}
          backgroundColor={
            drawerContent === 'calendar' ? colors.secondary : colors.secondary
          }
          anchor={drawerAnchor}
        >
          {getDrawerContent()}
        </EventDrawer>
      </AppBar>
    </div>
  );
}

export default EventClientHeader;
