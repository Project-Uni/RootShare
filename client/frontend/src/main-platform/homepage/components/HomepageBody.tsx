import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import WelcomeMessage from './WelcomeMessage';
import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

//FOR TESTING PURPOSE
import { AshwinHeadshot } from '../../../images/team';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primary,
    overflow: 'scroll',
  },
  postProfilePic: {
    height: 50,
    borderRadius: 50,
  },
}));

type Props = {};

function HomepageBody(props: Props) {
  const styles = useStyles();
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  //TODO - Use default state false for this once connected to server, and set to true if its their first visit
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function renderNewPost() {
    return (
      <div>
        <img src={AshwinHeadshot} className={styles.postProfilePic} alt="Profile" />
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage closeWelcomeMessage={closeWelcomeMessage} />
      )}
      {renderNewPost()}
    </div>
  );
}

export default HomepageBody;
