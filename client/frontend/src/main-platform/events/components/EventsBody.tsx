import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import { Event } from '../../reusable-components';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primaryText,
    overflow: 'scroll',
  },
  body: {},
  searchBar: {
    flex: 1,
    marginRight: 10,
  },
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginLeft: 20,
    marginRight: 20,
  },
}));

type Props = {};

function EventsBody(props: Props) {
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

  function renderEvents() {
    return (
      <Event
        title="The Baby Boilers Are Back"
        communityName="RootShare"
        communityID="rootshareID"
        summary={`Robbie Hummel, Ja\'Juan Johnson, and E\'Twaun Moore return to talk about what they have been up to since their time at Purdue`}
        description={`Robbie Hummel, Ja\'Juan Johnson, and E\'Twaun Moore will talk about their
    experiences post-graduation. Robbie has played in the NBA for a season or
    two, and played overseas for multiple. He is involved with startups now.
    Ja'\Juan has done the same, and is involved with startups now. E\'Twaun is
    currently on the New Orleans Pelicans and is having great success. The first
    45 minutes will be dedicated to the three talking about their experiences.
    The remaining 15 minutes will be dedicated to questions from the fans.`}
        timestamp={'August 14, 2020 7:00 PM'}
        mutualSignups={109}
        rsvpYes={false}
      />
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Events"
          message="You can find future events that are accessible to you on this page."
          onClose={closeWelcomeMessage}
        />
      )}
      <div className={styles.body}>{renderEvents()}</div>
    </div>
  );
}

export default EventsBody;
