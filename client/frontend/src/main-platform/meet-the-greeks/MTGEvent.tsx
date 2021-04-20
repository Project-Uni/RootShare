import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Theme from '../../theme/Theme';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../redux/actions';

import { CircularProgress, Box, Slide, Avatar, Collapse } from '@material-ui/core';
import ReactPlayer from 'react-player';

import { Event } from './MeetTheGreeks';
import { RSText } from '../../base-components';
import { RSButtonV2 } from '../reusable-components';
import { InterestedButton } from '../community/components/MeetTheGreeks';

import { checkDesktop, formatDatePretty, formatTime } from '../../helpers/functions';
import { GrandPrixPromotionBanner } from '../../images';

dayjs.extend(utc);
dayjs.extend(timezone);

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
  loadingIndicator: {
    color: Theme.secondaryText,
  },
  description: {
    marginLeft: 30,
  },
  interestedButton: {
    marginTop: 10,
    width: 235,
  },
  mobileButton: {
    marginBottom: 10,
  },
  mobileDesc: {
    marginTop: 10,
    marginBottom: 10,
  },
}));

type Props = {
  className?: string;
  event: Event;
};

const MTGEvent = (props: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();

  const {
    className,
    event: {
      _id: eventID,
      introVideoURL,
      eventImage,
      community: { _id: communityID, name: communityName, profilePicture },
    },
  } = props;

  const [showVideo, setShowVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const isDesktop = useRef(checkDesktop());
  const maxVideoHeight = useRef(isDesktop.current ? 400 : 300);

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

  const onEnterEvent = () => {
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
            size={isDesktop.current ? 14 : 12}
            type="head"
            bold
          >{`Grand Prix - ${communityName}`}</RSText>
        </a>
      </div>
      <div
        style={{
          background: Theme.dark,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: showVideo ? maxVideoHeight.current : imageDivHeight,
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
                height={maxVideoHeight.current}
                onReady={() => setVideoLoading(false)}
                style={{ display: videoLoading ? 'none' : 'block' }}
                onError={() => {
                  setVideoLoading(false);
                  setShowVideo(false);
                  dispatch(
                    dispatchSnackbar({
                      mode: 'error',
                      message: 'There was an error loading the video',
                    })
                  );
                }}
              />
            </div>
          </Slide>
        )}
        {!showVideo && (
          <Slide direction="right" in={!showVideo}>
            <img
              src={eventImage || GrandPrixPromotionBanner}
              alt={`${communityName} Event Banner`}
              style={{
                maxHeight: isDesktop.current ? 300 : undefined,
                maxWidth: !isDesktop.current ? '100%' : undefined,
                objectFit: 'contain',
                width: '100%',
              }}
              ref={imageRef}
              onLoad={onImageLoaded}
            />
          </Slide>
        )}
      </div>
      {isDesktop.current ? (
        <DesktopMTGEventContent
          event={props.event}
          onEnterEvent={onEnterEvent}
          onWatchVideoClick={introVideoURL ? onWatchVideoClick : undefined}
          showVideo={showVideo}
        />
      ) : (
        <MobileMTGEventContent
          event={props.event}
          onEnterEvent={onEnterEvent}
          onWatchVideoClick={introVideoURL ? onWatchVideoClick : undefined}
          showVideo={showVideo}
        />
      )}
    </Box>
  );
};

export default MTGEvent;

type ContentProps = {
  event: Event;
  onEnterEvent: () => void;
  onWatchVideoClick?: () => void;
  showVideo: boolean;
};

const DesktopMTGEventContent = (props: ContentProps) => {
  const styles = useStyles();

  const {
    event: {
      description,
      dateTime,
      community: { _id: communityID, name: communityName },
    },
    onEnterEvent,
    onWatchVideoClick,
    showVideo,
  } = props;

  const formattedDateTime = useRef(convertEST(dateTime));

  return (
    <>
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
            {formattedDateTime.current.date}
          </RSText>
          <RSText>
            <b>Time: </b>
            12:00 PM ET
            {/* TODO - This is stored correctly, but need to figure out why its rendering incorrectly */}
            {/* {formattedDateTime.current.time} */}
          </RSText>

          <RSButtonV2
            onClick={onEnterEvent}
            className={styles.interestedButton}
            borderRadius={25}
          >
            <RSText size={10}>Enter Event</RSText>
          </RSButtonV2>

          {/* {onWatchVideoClick && (
              <RSButtonV2 onClick={onWatchVideoClick}>
                {showVideo ? 'Hide' : 'Watch'} Video
              </RSButtonV2>
            )} */}

          <InterestedButton
            className={styles.interestedButton}
            communityID={communityID}
          />
        </div>
      </div>
    </>
  );
};

const MobileMTGEventContent = (props: ContentProps) => {
  const styles = useStyles();

  const {
    event: {
      description,
      dateTime,
      community: { _id: communityID, name: communityName },
    },
    onEnterEvent,
    onWatchVideoClick,
    showVideo,
  } = props;

  const [showDescription, setShowDescription] = useState(false);

  const formattedDateTime = useRef(convertEST(dateTime));

  return (
    <div onClick={() => setShowDescription((prev) => !prev)} style={{ margin: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flexGrow: 1 }}>
          <a href={`/community/${communityID}`} className={styles.linkText}>
            <RSText bold>Hosted by {communityName}</RSText>
          </a>
          <div style={{ marginTop: 15 }}>
            <RSText>
              <b>Date: </b>
              {formattedDateTime.current.date}
            </RSText>
            <RSText>
              <b>Time: </b>
              1:00 PM EST
              {/* TODO - This is stored correctly, but need to figure out why its rendering incorrectly */}
              {/* {formattedDateTime.current.time} EST */}
            </RSText>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <RSButtonV2
            onClick={(e) => {
              e.stopPropagation();
              onEnterEvent();
            }}
            className={styles.mobileButton}
          >
            <RSText size={10}>Enter Event</RSText>
          </RSButtonV2>
          <InterestedButton
            className={styles.mobileButton}
            communityID={communityID}
          />
        </div>
      </div>
      <Collapse in={showDescription}>
        <RSText className={styles.mobileDesc}>{description}</RSText>
      </Collapse>
    </div>
  );
};

const convertEST = (timestamp: Date | string) => {
  const date = dayjs.tz(timestamp, 'America/New_York').format('dddd MMMM D');
  const time = dayjs.tz(timestamp, 'America/New_York').format('h:mm A');
  return { date, time };
  // return dayjs.tz(timestamp, 'America/New_York').format('dddd MMMM D @ h:mm A');
};
