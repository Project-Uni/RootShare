import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';

import { GiTreeBranch } from 'react-icons/gi';
import { FaSearch, FaHome, FaRegCalendarAlt } from 'react-icons/fa';
import { IoMdText } from 'react-icons/io';
import { MdGroup } from 'react-icons/md';
import { BsPersonFill } from 'react-icons/bs';

const HEADER_HEIGHT = 60;
const TEXT_SIZE = 22;
const ICON_SIZE = 32;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.secondary,
    width: 250,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 30,
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

type Props = {
  currentTab:
    | 'home'
    | 'discover'
    | 'communities'
    | 'events'
    | 'messages'
    | 'connections'
    | 'profile';
};

function MainNavigator(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

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
      name: 'Messages',
      icon: (
        <IoMdText
          size={ICON_SIZE}
          color={
            props.currentTab === 'messages' ? colors.bright : colors.primaryText
          }
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
    },
  ];

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function renderLinks() {
    const output = [];
    for (let i = 0; i < tabs.length; i++) {
      output.push(
        <a href={`/${tabs[i].name.toLowerCase()}`} className={styles.link}>
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
      {renderLinks()}
    </div>
  );
}

export default MainNavigator;
