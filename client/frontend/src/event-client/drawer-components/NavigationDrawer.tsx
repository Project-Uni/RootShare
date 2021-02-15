import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { GiTreeBranch } from 'react-icons/gi';
import { FaHome, FaRegCalendarAlt } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import { BsPersonFill } from 'react-icons/bs';

import RSText from '../../base-components/RSText';
import Theme from '../../theme/Theme';
import { RSLink } from '../../main-platform/reusable-components';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  linkContainer: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 40,
  },
  link: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 20,
    textDecoration: 'none',
  },
  textStyle: {
    marginLeft: 30,
  },
  unselectedTab: {
    color: Theme.primary,
  },
  selectedTab: {
    color: Theme.bright,
  },
}));

const TEXT_SIZE = 22;
const ICON_SIZE = 32;

type AVAILABLE_TABS =
  | 'home'
  | 'communities'
  | 'events'
  | 'connections'
  | 'profile'
  | 'none';

type Props = {};

function NavigationDrawer(props: Props) {
  const styles = useStyles();
  const history = useHistory();

  const [currentTab, setCurrentTab] = useState<AVAILABLE_TABS>();

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

  const tabs = [
    {
      name: 'Home',
      icon: (
        <GiTreeBranch
          size={ICON_SIZE}
          color={currentTab === 'home' ? Theme.bright : Theme.primaryText}
        />
      ),
    },
    {
      name: 'Communities',
      icon: (
        <FaHome
          size={ICON_SIZE}
          color={currentTab === 'communities' ? Theme.bright : Theme.primaryText}
        />
      ),
      link: '/communities/user',
    },
    {
      name: 'Events',
      icon: (
        <FaRegCalendarAlt
          size={ICON_SIZE}
          color={currentTab === 'events' ? Theme.bright : Theme.primaryText}
        />
      ),
    },
    {
      name: 'Connections',
      icon: (
        <MdGroup
          size={ICON_SIZE}
          color={currentTab === 'connections' ? Theme.bright : Theme.primaryText}
        />
      ),
      link: '/connections/user',
    },
    {
      name: 'Profile',
      icon: (
        <BsPersonFill
          size={ICON_SIZE}
          color={currentTab === 'profile' ? Theme.bright : Theme.primaryText}
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
          key={`navigation_${i}`}
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
    <div className={styles.wrapper}>
      <div className={styles.linkContainer}>{renderLinks()}</div>
    </div>
  );
}

export default NavigationDrawer;
