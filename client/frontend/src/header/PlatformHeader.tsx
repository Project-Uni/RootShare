import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Theme as MuiTheme,
} from '@material-ui/core';
import { RSLogoFullBeta } from '../images';

import { MdGroupAdd, MdAccountCircle, MdMenu } from 'react-icons/md';
import { IoMdText } from 'react-icons/io';

import DrawerBase from './drawer-components/DrawerBase';

import Theme from '../theme/Theme';

import {
  CalendarDrawer,
  ConnectionsDrawer,
  MessagesDrawerContainer,
  ProfileDrawer,
  NavigationDrawer,
} from './drawer-components';
import { checkDesktop } from '../helpers/functions';
import { RSLink, RSButton } from '../main-platform/reusable-components';
import { AiFillCaretDown } from 'react-icons/ai';
import { HeaderSearch, NotificationButton } from '.';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  header: {
    background: muiTheme.background.secondary,
  },
  link: {
    color: Theme.bright,
    marginRight: 15,
    fontSize: '17px',
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

type Props = {
  minWidth?: number;
  showNavigationWidth?: number;
  showNavigationMenuDefault?: boolean;
  authenticated?: boolean;
};

function PlatformHeader(props: Props) {
  const styles = useStyles();
  const history = useHistory();

  const { showNavigationWidth, showNavigationMenuDefault, authenticated } = props;

  const [drawerContent, setDrawerContent] = useState('');
  const [drawerAnchor, setDrawerAnchor] = useState<'left' | 'right'>('right');
  const minWidth = props.minWidth || 100;
  const [width, setWidth] = useState(
    window.innerWidth >= minWidth ? window.innerWidth : props.minWidth
  );

  const isDesktop = useRef(checkDesktop());
  const iconSize = useRef(isDesktop.current ? 32 : 24);

  const [menuAnchorEl, setMenuAnchorEl] = useState<any>();

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
    setMenuAnchorEl(undefined);
  }

  function handleMessagesClick() {
    setDrawerAnchor('right');
    setDrawerContent('messages');
    setMenuAnchorEl(undefined);
  }

  function handleProfileClick() {
    setDrawerAnchor('right');
    setDrawerContent('profile');
    setMenuAnchorEl(undefined);
  }

  function handleNavigationClick() {
    setDrawerAnchor('left');
    setDrawerContent('navigation');
    setMenuAnchorEl(undefined);
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
        return <NavigationDrawer />;
      default:
        return null;
    }
  }

  const renderIcons = () => {
    const iconProps = { size: iconSize.current, color: Theme.primary };
    // if (isDesktop.current && window.innerWidth >= 800) {
    return (
      <div style={{ display: 'flex', width: 'fit-content' }}>
        <IconButton onClick={handleConnectionsClick}>
          <MdGroupAdd {...iconProps} />
        </IconButton>
        <IconButton onClick={handleMessagesClick}>
          <IoMdText {...iconProps} />
        </IconButton>
        <IconButton onClick={handleProfileClick}>
          <MdAccountCircle {...iconProps} />
        </IconButton>
        <NotificationButton />
      </div>
    );
    // }
    // return (
    //   <div style={{ display: 'flex' }}>
    //     <NotificationButton />
    //     <IconButton onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
    //       <AiFillCaretDown color={theme.primary} />
    //     </IconButton>
    //     <Menu
    //       open={Boolean(menuAnchorEl)}
    //       anchorEl={menuAnchorEl}
    //       onClose={() => setMenuAnchorEl(undefined)}
    //     >
    //       <MenuItem onClick={handleConnectionsClick}>Connections</MenuItem>
    //       <MenuItem onClick={handleMessagesClick}>Messages</MenuItem>
    //       <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
    //     </Menu>
    //   </div>
    // );
  };

  const LoginButtons = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <RSLink href={'/login'} className={styles.link}>
          Login
        </RSLink>
        <RSButton onClick={() => history.push('/')}>Sign Up</RSButton>
      </div>
    );
  };

  return (
    <div style={{ width: width, minWidth: minWidth }}>
      <AppBar position="static" className={styles.header}>
        <Toolbar>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flex: 1,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {(showNavigationMenuDefault ||
                  (showNavigationWidth &&
                    window.innerWidth < showNavigationWidth)) && (
                  <IconButton onClick={handleNavigationClick}>
                    <MdMenu color={Theme.primary} size={28} />
                  </IconButton>
                )}
                <RSLink href="/home">
                  <img
                    src={RSLogoFullBeta}
                    alt="RootShare"
                    style={{
                      width: isDesktop.current ? 190 : 130,
                    }}
                  />
                </RSLink>
              </div>
              {window.innerWidth >= 800 && authenticated ? (
                <HeaderSearch />
              ) : (
                undefined
              )}
              {authenticated ? renderIcons() : <LoginButtons />}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              {window.innerWidth < 800 && authenticated ? (
                <HeaderSearch style={{ marginBottom: 7 }} />
              ) : (
                undefined
              )}
            </div>
          </div>
        </Toolbar>
        {authenticated && (
          <DrawerBase
            open={Boolean(drawerContent)}
            handleClose={handleDrawerClose}
            backgroundColor={
              drawerContent === 'calendar' ? Theme.primary : Theme.white
            }
            anchor={drawerAnchor}
          >
            {getDrawerContent()}
          </DrawerBase>
        )}
      </AppBar>
    </div>
  );
}

export default PlatformHeader;
