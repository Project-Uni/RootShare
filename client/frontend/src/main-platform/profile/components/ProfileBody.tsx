import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import { DhruvHeadshot } from '../../../images/team';
import RSText from '../../../base-components/RSText';
import { Button } from '@material-ui/core';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primaryText,
    overflow: 'scroll',
  },
  body: {},
  coverPhoto: {
    background: 'lightgreen',
    // background: colors.bright,
    height: 250,
  },
  profilePicture: {
    height: 200,
    width: 200,
    borderRadius: 200,
    marginTop: -100,
    border: `8px solid ${colors.primaryText}`,
    // marginLeft: 90,
    marginLeft: 50,
  },
  head: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 50,
    marginRight: 50,
  },
  headLeft: {
    flex: 1,
    textAlign: 'left',
    marginRight: 50,
  },
  headRight: {
    textAlign: 'left',
    width: 125,
  },
  connectButton: {
    color: colors.primaryText,
    background: colors.bright,
    paddingLeft: 25,
    paddingRight: 25,
    marginBottom: 15,
  },
  bio: {
    marginTop: 7,
  },
  numbers: {
    marginTop: 1,
  },
}));

type Props = {};

function ProfileBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    console.log('Fetching data');
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function renderProfileAndBackground() {
    return (
      <div style={{ textAlign: 'left' }}>
        <div className={styles.coverPhoto}></div>
        <img src={DhruvHeadshot} className={styles.profilePicture} />
      </div>
    );
  }

  function renderProfileHead() {
    return (
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <RSText type="head" size={24} bold color={colors.primary}>
            Dhruv Patel
          </RSText>
          <RSText type="subhead" size={14} color={colors.secondaryText}>
            Purdue 2020
          </RSText>
          <RSText type="subhead" size={14} color={colors.secondaryText}>
            Chief Operating Officer, RootShare
          </RSText>
          <RSText
            type="subhead"
            size={14}
            color={colors.primary}
            className={styles.bio}
          >
            Hello! My name is Dhruv Patel and I am a big fan of Roots! I love roots
            so much that I started a company where we can all share our roots. I hope
            you guys enjoy my profile! Big Root guy here.
          </RSText>
        </div>
        <div className={styles.headRight}>
          <Button variant="contained" className={styles.connectButton} size="large">
            Connect
          </Button>
          <RSText
            type="subhead"
            size={12}
            color={colors.secondary}
            italic
            className={styles.numbers}
          >
            804 Connections
          </RSText>
          <RSText
            type="subhead"
            size={12}
            color={colors.secondary}
            italic
            className={styles.numbers}
          >
            34 Mutual
          </RSText>
          <RSText
            type="subhead"
            size={12}
            color={colors.secondary}
            italic
            className={styles.numbers}
          >
            6 Communities
          </RSText>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Profile"
          message="See detailed information about each user, what organizations they have joined, and what virtual events they will attend."
          onClose={closeWelcomeMessage}
        />
      )}
      <div className={styles.body}>
        {renderProfileAndBackground()}
        {renderProfileHead()}
      </div>
    </div>
  );
}

export default ProfileBody;
