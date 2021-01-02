import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Theme from '../../theme/Theme';
import { CircularProgress, Box, Slide, Avatar } from '@material-ui/core';

import ReactPlayer from 'react-player';

import { Event } from './MeetTheGreeks';
import { RSText } from '../../base-components';
import { formatDatePretty, formatTime } from '../../helpers/functions';
import { RSButton } from '../reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: Theme.white,
    paddingTop: 1,
    paddingBottom: 1,
    textAlign: 'left',
  },
  linkText: {
    color: 'inherit',
    textDecoration: 'none',
    '&:visited': {
      color: 'inherit',
    },
    '&:hover': {
      textDecoration: 'underline',
    },
    display: 'inline-block',
  },
  banner: {
    maxHeight: 300,
    objectFit: 'contain',
  },
  description: {
    marginLeft: 30,
  },
  loadingIndicator: {
    color: Theme.secondaryText,
  },
  interestedButton: {
    marginTop: 10,
    width: 235,
  },
}));

type Props = {
  className?: string;
  event: Event;
  dispatchSnackbar: (mode: 'success' | 'notify' | 'error', message: string) => void;
};

function MTGEvent(props: Props) {
  const styles = useStyles();

  const {
    className,
    event: {
      _id: eventID,
      description,
      introVideoURL,
      dateTime,
      eventBanner,
      community: { _id: communityID, name: communityName, profilePicture },
    },
    dispatchSnackbar,
  } = props;

  const [showVideo, setShowVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDivHeight, setImageDivHeight] = useState(300);

  const onWatchVideoClick = () => {
    setShowVideo((prev) => {
      if (prev) setVideoLoading(false);
      else setVideoLoading(true);
      return !prev;
    });
  };

  const onImageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (imageRef.current) setImageDivHeight(imageRef.current.clientHeight);
  };

  const enterEvent = () => {
    window.open(`/event/${eventID}`);
  };

  return (
    <Box
      borderRadius={10}
      boxShadow={2}
      className={[className, styles.wrapper].join(' ')}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: 10,
          marginBottom: 10,
          marginLeft: 15,
          marginRight: 15,
        }}
      >
        <a href={`/community/${communityID}`} style={{ textDecoration: 'none' }}>
          <Avatar
            src={profilePicture}
            alt={communityName}
            style={{ marginRight: 15, height: 50, width: 50 }}
          />
        </a>
        <a href={`/community/${communityID}`} className={styles.linkText}>
          <RSText
            size={14}
            type="head"
            bold
          >{`Meet The Greeks - ${communityName}`}</RSText>
        </a>
      </div>
      <div
        style={{
          background: Theme.dark,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: showVideo ? 400 : imageDivHeight,
        }}
      >
        {showVideo && (
          <Slide direction="left" in={showVideo}>
            <div
              style={{
                height: 'inherit',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {videoLoading && (
                <CircularProgress size={60} className={styles.loadingIndicator} />
              )}
              <ReactPlayer
                url={introVideoURL}
                controls={true}
                height={400}
                onReady={() => setVideoLoading(false)}
                style={{ display: videoLoading ? 'none' : 'block' }}
                onError={() => {
                  setVideoLoading(false);
                  setShowVideo(false);
                  dispatchSnackbar('error', 'There was an error loading the video');
                }}
              />
            </div>
          </Slide>
        )}
        {!showVideo && (
          <Slide direction="right" in={!showVideo}>
            <img
              src={eventBanner}
              alt={`${communityName} Event Banner`}
              className={styles.banner}
              ref={imageRef}
              onLoad={onImageLoaded}
            />
          </Slide>
        )}
      </div>
      <div
        style={{
          margin: '10px 15px',
          display: 'flex',
          justifyContent: 'flex-start',
        }}
      >
        <a href={`/community/${communityID}`} className={styles.linkText}>
          <RSText bold>Hosted by {communityName}</RSText>
        </a>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1 }}>
          <RSText className={styles.description}>{description}</RSText>
        </div>
        <div style={{ width: 275 }}>
          <RSText>
            <b>Date: </b>
            {formatDatePretty(new Date(dateTime))}
          </RSText>
          <RSText>
            <b>Time: </b>
            {formatTime(new Date(dateTime))} EST
          </RSText>
          <div style={{ display: 'flex', marginTop: 15 }}>
            <RSButton onClick={enterEvent}>Enter Event</RSButton>
            <span style={{ width: 15 }}></span>
            <RSButton onClick={onWatchVideoClick}>
              {showVideo ? 'Hide' : 'Watch'} Video
            </RSButton>
          </div>
          <RSButton variant="secondary" className={styles.interestedButton}>
            I'm Interested
          </RSButton>
        </div>
      </div>
    </Box>
  );
}

export default MTGEvent;
