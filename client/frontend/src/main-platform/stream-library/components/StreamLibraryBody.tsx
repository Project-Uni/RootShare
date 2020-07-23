import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import Stream from './Stream';

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
  stream: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    borderBottom: `1px solid ${colors.secondaryText}`,
    paddingBottom: 15,
  },
}));

type Props = {};

function StreamLibraryBody(props: Props) {
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

  function renderStreams() {
    const output = [];
    for (let i = 0; i < 8; i++) {
      output.push(
        <Stream
          eventID="testID"
          eventTitle="The Baby Boilers Are Back"
          eventDesc="The Baby Boilers return for a once in a lifetime event. Prepare to be amazed as you watch what they have been up to sinc their time at Purdue!! The Baby Boilers return for a once in a lifetime event. Prepare to be amazed as you watch what they have been up to sinc their time at Purdue!! "
          eventHostName="RootShare"
          eventHostID="testID"
          eventDate="Aug 14, 2020"
          className={styles.stream}
          liked={i % 3 == 0}
        />
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Video Library"
          message="Previous events hosted on RootShare are visible here for your on-demand viewing."
          onClose={closeWelcomeMessage}
        />
      )}
      <div className={styles.body}>{renderStreams()}</div>
    </div>
  );
}

export default StreamLibraryBody;
