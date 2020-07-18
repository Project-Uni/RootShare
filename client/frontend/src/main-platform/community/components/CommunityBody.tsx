import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';

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

function CommunityBody(props: Props) {
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

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Community"
          message="This is a community. You can talk with other people who are also involved in this community."
          onClose={closeWelcomeMessage}
        />
      )}
      <div className={styles.body}></div>
    </div>
  );
}

export default CommunityBody;