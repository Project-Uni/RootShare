import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { GiTreeBranch } from 'react-icons/gi';
import { FaSearch, FaHome, FaRegCalendarAlt } from 'react-icons/fa';
import { MdGroup, MdOndemandVideo } from 'react-icons/md';
import { BsPersonFill } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const HEADER_HEIGHT = 64;
const TEXT_SIZE = 22;
const ICON_SIZE = 32;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.second,
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

type AVAILABLE_TABS =
  | 'home'
  | 'discover'
  | 'communities'
  | 'events'
  | 'connections'
  | 'profile'
  | 'library'
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
          color={props.currentTab === 'home' ? colors.bright : colors.primaryText}
        />
      ),
    },
    {
      name: 'Discover',
      icon: (
        <FaSearch
          size={ICON_SIZE}
          color={
            props.currentTab === 'discover' ? colors.bright : colors.primaryText
          }
        />
      ),
    },
    {
      name: 'Communities',
      icon: (
        <FaHome
          size={ICON_SIZE}
          color={
            props.currentTab === 'communities' ? colors.bright : colors.primaryText
          }
        />
      ),
    },
    {
      name: 'Events',
      icon: (
        <FaRegCalendarAlt
          size={ICON_SIZE}
          color={props.currentTab === 'events' ? colors.bright : colors.primaryText}
        />
      ),
    },
    {
      name: 'Library',
      icon: (
        <MdOndemandVideo
          size={ICON_SIZE}
          color={props.currentTab === 'library' ? colors.bright : colors.primaryText}
        />
      ),
    },
    {
      name: 'Connections',
      icon: (
        <MdGroup
          size={ICON_SIZE}
          color={
            props.currentTab === 'connections' ? colors.bright : colors.primaryText
          }
        />
      ),
    },
    {
      name: 'Profile',
      icon: (
        <BsPersonFill
          size={ICON_SIZE}
          color={props.currentTab === 'profile' ? colors.bright : colors.primaryText}
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
                ? colors.bright
                : colors.primaryText
            }
            size={TEXT_SIZE}
            bold
            className={styles.textStyle}
            hoverColor={colors.bright}
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
