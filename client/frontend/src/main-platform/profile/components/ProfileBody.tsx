import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../../../theme/Colors';
import ProfileHead from './ProfileHead';
import ProfileEvent from './ProfileEvent';
import { WelcomeMessage } from '../../reusable-components';
import { DhruvHeadshot } from '../../../images/team';
import RSText from '../../../base-components/RSText';

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

  function renderRegisteredEvents() {
    return (
      <div style={{ marginLeft: 6, marginRight: 6 }}>
        <ProfileEvent />
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {/* {showWelcomeModal && (
        <WelcomeMessage
          title="Profile"
          message="See detailed information about each user, what organizations they have joined, and what virtual events they will attend."
          onClose={closeWelcomeMessage}
        />
      )} */}
      <div className={styles.body}>
        {renderProfileAndBackground()}
        <ProfileHead />
        {renderRegisteredEvents()}
      </div>
    </div>
  );
}

export default ProfileBody;
