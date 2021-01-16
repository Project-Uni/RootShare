import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton } from '@material-ui/core';
import RootShareLogo from '../images/RootShareLogoFull.png';

import { MdGroupAdd, MdAccountCircle, MdMenu } from 'react-icons/md';
import { IoMdText } from 'react-icons/io';

import { GrSearch } from 'react-icons/gr';

import EventDrawer from './EventDrawer';

import theme from '../theme/Theme';

import {
  CalendarDrawer,
  ConnectionsDrawer,
  MessagesDrawerContainer,
  ProfileDrawer,
  NavigationDrawer,
} from './drawer-components';
import { checkDesktop } from '../helpers/functions';
import { UserSearch } from '../main-platform/reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  header: {
    background: theme.white,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  searchbar: {
    width: 400,
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
        <IconButton onClick={handleConnectionsClick}>
          <MdGroupAdd size={iconSize} color={theme.primary} />
        </IconButton>
        <IconButton onClick={handleMessagesClick}>
          <IoMdText size={iconSize} color={theme.primary} />
        </IconButton>
        <IconButton onClick={handleProfileClick}>
          <MdAccountCircle color={theme.primary} size={iconSize} />
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
                <MdMenu color={theme.primary} size={28} />
              </IconButton>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <a href="/home">
                <img
                  src={RootShareLogo}
                  alt="RootShare"
                  style={{
                    width: isDesktop ? 190 : 130,
                  }}
                />
              </a>
            </div>

            <UserSearch
              mode="both"
              name="header-search"
              placeholder="Search RootShare"
              className={styles.searchbar}
              adornment={<GrSearch />}
            />
          </div>

          <div>{isDesktop && renderIcons()}</div>
        </Toolbar>
        <EventDrawer
          open={Boolean(drawerContent)}
          handleClose={handleDrawerClose}
          backgroundColor={
            drawerContent === 'calendar' ? theme.primary : theme.white
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
