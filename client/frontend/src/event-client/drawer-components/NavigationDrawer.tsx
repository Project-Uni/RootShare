import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { GiTreeBranch } from 'react-icons/gi';
import { FaSearch, FaHome, FaRegCalendarAlt } from 'react-icons/fa';
import { MdGroup, MdOndemandVideo } from 'react-icons/md';
import { BsPersonFill } from 'react-icons/bs';

import { colors } from '../../theme/Colors';
import RSText from '../../base-components/RSText';

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
}));

const TEXT_SIZE = 22;
const ICON_SIZE = 32;

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

function NavigationDrawer(props: Props) {
  const styles = useStyles();

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
      link: '/communities/user',
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
    // {
    //   name: 'Library',
    //   icon: (
    //     <MdOndemandVideo
    //       size={ICON_SIZE}
    //       color={props.currentTab === 'library' ? colors.bright : colors.primaryText}
    //     />
    //   ),
    // },
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
      link: '/connections/user',
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
    <div className={styles.wrapper}>
      <div className={styles.linkContainer}>{renderLinks()}</div>{' '}
    </div>
  );
}

export default NavigationDrawer;
