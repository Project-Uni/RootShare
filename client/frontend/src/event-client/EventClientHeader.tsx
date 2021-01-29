import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, IconButton, Menu, MenuItem } from '@material-ui/core';
import RootShareLogo from '../images/RootShareLogoFull.png';

import { MdGroupAdd, MdAccountCircle, MdMenu } from 'react-icons/md';
import { IoMdText } from 'react-icons/io';

import { FaSearch } from 'react-icons/fa';

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
import { SearchField } from '../main-platform/reusable-components';
import { AiFillCaretDown } from 'react-icons/ai';

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
    marginLeft: 10,
    marginRight: 25,
  },
  collapsedSearch: {
    maxWidth: 0,
    opacity: 0,
  },
  visibleSearch: {
    maxWidth: 400,
    opacity: 1,
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

  const isDesktop = useRef(checkDesktop());
  const iconSize = useRef(isDesktop.current ? 32 : 24);

  const [menuAnchorEl, setMenuAnchorEl] = useState<any>();

  const [showSearch, setShowSearch] = useState(false);
  const searchFieldRef = useRef<HTMLDivElement>(null);

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

  const handleSearchIconHover = () => {
    setShowSearch(true);
    setTimeout(() => {
      searchFieldRef.current?.focus();
    }, 1200);
  };

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
    const iconProps = { size: iconSize.current, color: theme.primary };
    if (isDesktop.current && window.innerWidth >= 600) {
      return (
        <div style={{ marginLeft: 25 }}>
          <IconButton onClick={handleConnectionsClick}>
            <MdGroupAdd {...iconProps} />
          </IconButton>
          <IconButton onClick={handleMessagesClick}>
            <IoMdText {...iconProps} />
          </IconButton>
          <IconButton onClick={handleProfileClick}>
            <MdAccountCircle {...iconProps} />
          </IconButton>
        </div>
      );
    }
    return (
      <div style={{ marginLeft: 25 }}>
        <IconButton onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
          <AiFillCaretDown color={theme.primary} />
        </IconButton>
        <Menu
          open={Boolean(menuAnchorEl)}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(undefined)}
        >
          <MenuItem onClick={handleConnectionsClick}>Connections</MenuItem>
          <MenuItem onClick={handleMessagesClick}>Messages</MenuItem>
          <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
        </Menu>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ width: width, minWidth: minWidth }}>
      <AppBar position="static" className={styles.header}>
        <Toolbar className={styles.toolbar}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {(props.showNavigationMenuDefault ||
              (props.showNavigationWidth &&
                window.innerWidth < props.showNavigationWidth)) && (
              <IconButton onClick={handleNavigationClick}>
                <MdMenu color={theme.primary} size={28} />
              </IconButton>
            )}

            <div
              style={
                window.innerWidth >= 767
                  ? { display: 'flex', alignItems: 'center', flex: 1 }
                  : {
                      flex: 1,
                    }
              }
            >
              <a href="/home">
                <img
                  src={RootShareLogo}
                  alt="RootShare"
                  style={{
                    width: isDesktop.current ? 190 : 130,
                  }}
                />
              </a>
              <div style={{ marginLeft: 55 }}>
                <IconButton
                  onClick={() => {
                    if (!showSearch) handleSearchIconHover();
                    else setShowSearch(false);
                  }}
                >
                  <FaSearch size={32} color={theme.bright} />
                </IconButton>
              </div>
              <SearchField
                style={{
                  transition: `max-width 0.75s ease, opacity ${
                    showSearch ? 0.2 : 0.6
                  }s ease`,
                }}
                mode="both"
                name="header-search"
                placeholder="Search RootShare..."
                className={[
                  styles.searchbar,
                  showSearch ? styles.visibleSearch : styles.collapsedSearch,
                ].join(' ')}
                fetchDataURL="/api/discover/search/v1/exactMatch"
                renderLimit={10}
                onAutocomplete={(selectedOption) => {
                  window.location.href = `/${
                    selectedOption.type === 'community' ? 'community' : 'profile'
                  }/${selectedOption._id}`;
                }}
                fullWidth
                freeSolo
                groupByType
                variant="standard"
                bigText
                ref={searchFieldRef}
              />
            </div>
          </div>

          <div>{renderIcons()}</div>
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
