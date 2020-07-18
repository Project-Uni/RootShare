import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

import { WelcomeMessage, UserPost } from '../../reusable-components';
import MakePostContainer from './MakePostContainer';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primaryText,
    overflow: 'scroll',
    minWidth: 600,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 80,
  },
}));

type Props = {};

function HomepageBody(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  //TODO - Use default state false for this once connected to server, and set to true if its their first visit
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [postValue, setPostValue] = useState('');

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    setTimeout(() => {
      console.log('Fetching data');
      return true;
    }, 1000);
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function handlePostValueChange(event: any) {
    setPostValue(event.target.value);
  }

  function handleImageUpload() {
    console.log('Uploading image');
  }

  function handleSubmitPost() {
    console.log('Submitting post');
  }

  function handleDiscoverClick() {
    window.location.href = `${window.location.protocol}//${window.location.host}/discover`;
  }

  function renderFeed() {
    return <UserPost />;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Welcome to RootShare!"
          message="Every success story is rooted in the support from a community. Join your
        communities or discover new ones today."
          onClose={closeWelcomeMessage}
          buttonText="Discover"
          buttonAction={handleDiscoverClick}
        />
      )}
      <MakePostContainer
        postValue={postValue}
        onChange={handlePostValueChange}
        onPost={handleSubmitPost}
        onUploadImage={handleImageUpload}
      />
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : (
        renderFeed()
      )}
    </div>
  );
}

export default HomepageBody;
