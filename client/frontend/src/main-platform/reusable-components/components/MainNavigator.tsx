import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { GiTreeBranch } from 'react-icons/gi';
import { FaHome, FaRegCalendarAlt } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import { BsPersonFill } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import theme from '../../../theme/Theme';

import { HEADER_HEIGHT } from '../../../helpers/constants';

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
  },
  textStyle: {
    marginLeft: 30,
  },
}));

export type AVAILABLE_TABS =
  | 'home'
  | 'communities'
  | 'events'
  | 'connections'
  | 'profile'
  | 'none';

type Props = {
  currentTab: AVAILABLE_TABS;
};

function MainNavigator(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  const tabs = [
    {
      name: 'Home',
      icon: (
        <GiTreeBranch
          size={ICON_SIZE}
          color={props.currentTab === 'home' ? theme.bright : theme.primary}
        />
      ),
    },
    {
      name: 'Communities',
      icon: (
        <FaHome
          size={ICON_SIZE}
          color={props.currentTab === 'communities' ? theme.bright : theme.primary}
        />
      ),
      link: '/communities/user',
    },
    {
      name: 'Events',
      icon: (
        <FaRegCalendarAlt
          size={ICON_SIZE}
          color={props.currentTab === 'events' ? theme.bright : theme.primary}
        />
      ),
    },
    {
      name: 'Connections',
      icon: (
        <MdGroup
          size={ICON_SIZE}
          color={props.currentTab === 'connections' ? theme.bright : theme.primary}
        />
      ),
      link: '/connections/user',
    },
    {
      name: 'Profile',
      icon: (
        <BsPersonFill
          size={ICON_SIZE}
          color={props.currentTab === 'profile' ? theme.bright : theme.primary}
        />
      ),
      link: '/profile/user',
    },
  ];

  function renderLinks() {
    const output = [];
    for (let i = 0; i < tabs.length; i++) {
      output.push(
        <a
          href={tabs[i].link || `/${tabs[i].name.toLowerCase()}`}
          className={styles.link}
        >
          {tabs[i].icon}
          <RSText
            type="head"
            color={
              props.currentTab === tabs[i].name.toLowerCase()
                ? theme.bright
                : theme.primary
            }
            size={TEXT_SIZE}
            bold
            className={styles.textStyle}
            hoverColor={theme.bright}
          >
            {tabs[i].name}
          </RSText>
        </a>
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
