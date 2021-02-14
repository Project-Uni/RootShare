import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { GiTreeBranch } from 'react-icons/gi';
import { FaHome, FaRegCalendarAlt } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import { BsPersonFill } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import theme from '../../../theme/Theme';

import { HEADER_HEIGHT } from '../../../helpers/constants';
import { RSLink } from '../';
import { useHistory } from 'react-router-dom';

const TEXT_SIZE = 22;
const ICON_SIZE = 32;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: theme.background,
    width: 310,
  },
  linkContainer: {
    marginLeft: 30,
    marginRight: 27,
    marginTop: 30,
  },
  link: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 20,
    textDecoration: 'none',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  textStyle: {
    marginLeft: 30,
    '&:hover': {
      color: theme.brightHover,
    },
  },
  unselectedTab: {
    color: theme.primary,
  },
  selectedTab: {
    color: theme.bright,
  },
}));

export type AVAILABLE_TABS =
  | 'home'
  | 'communities'
  | 'events'
  | 'connections'
  | 'profile'
  | 'none';

type Props = {};

function MainNavigator(props: Props) {
  const styles = useStyles();
  const history = useHistory();

  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [currentTab, setCurrentTab] = useState<AVAILABLE_TABS>();

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    selectCurrentTab(history.location);

    const removeHistoryListen = history.listen((location, action) => {
      selectCurrentTab(location);
    });
    return removeHistoryListen;
  }, [history]);

  const selectCurrentTab = (location: typeof history.location) => {
    const { pathname } = location;
    let tab = pathname.split('/')[1];
    switch (tab) {
      case 'home':
      case 'communities':
      case 'events':
      case 'connections':
      case 'profile':
        break;
      case 'community':
        tab = 'communities';
        break;
      default:
        tab = 'none';
        break;
    }
    setCurrentTab(tab as AVAILABLE_TABS);
  };

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  const tabs = [
    {
      name: 'Home',
      icon: (
        <GiTreeBranch
          size={ICON_SIZE}
          color={currentTab === 'home' ? theme.bright : theme.primary}
        />
      ),
    },
    {
      name: 'Communities',
      icon: (
        <FaHome
          size={ICON_SIZE}
          color={currentTab === 'communities' ? theme.bright : theme.primary}
        />
      ),
      link: '/communities/user',
    },
    {
      name: 'Events',
      icon: (
        <FaRegCalendarAlt
          size={ICON_SIZE}
          color={currentTab === 'events' ? theme.bright : theme.primary}
        />
      ),
    },
    {
      name: 'Connections',
      icon: (
        <MdGroup
          size={ICON_SIZE}
          color={currentTab === 'connections' ? theme.bright : theme.primary}
        />
      ),
      link: '/connections/user',
    },
    {
      name: 'Profile',
      icon: (
        <BsPersonFill
          size={ICON_SIZE}
          color={currentTab === 'profile' ? theme.bright : theme.primary}
        />
      ),
      link: '/profile/user',
    },
  ];

  function renderLinks() {
    const output = [];
    for (let i = 0; i < tabs.length; i++) {
      output.push(
        <RSLink
          href={tabs[i].link || `/${tabs[i].name.toLowerCase()}`}
          className={styles.link}
          key={`navigation_tab_${i}`}
        >
          {tabs[i].icon}
          <RSText
            type="head"
            size={TEXT_SIZE}
            bold
            className={[
              styles.textStyle,
              currentTab === tabs[i].name.toLowerCase()
                ? styles.selectedTab
                : styles.unselectedTab,
            ].join(' ')}
          >
            {tabs[i].name}
          </RSText>
        </RSLink>
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <div className={styles.linkContainer}>{renderLinks()}</div>
    </div>
  );
}

export default MainNavigator;
