import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Box } from '@material-ui/core';
import { IconButton } from '@material-ui/core';

import { BsChevronDown, BsChevronRight } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { RootSharePreviewBanner } from '../../../images/events';
import Theme from '../../../theme/Theme';
import { RSLink } from '..';

const MAX_SUBSTR_LEN = 200;

const useStyles = makeStyles((_: any) => ({
  box: {
    background: Theme.white,
  },
  wrapper: {
    marginLeft: 1,
    marginRight: 1,
    borderRadius: 1,
    textAlign: 'left',
    padding: 15,
  },
  bodyWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  banner: {
    height: 125,
    objectFit: 'cover',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  summary: {
    marginBottom: 10,
    marginTop: 10,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventName: {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  seeMoreButtonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  seeMoreButton: {
    color: Theme.primaryText,
    marginRight: -9,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    background: Theme.bright,
    color: Theme.altText,
    '&:hover': {
      background: Theme.brightHover,
    },
  },
  goToEventButton: {
    background: Theme.bright,
    color: Theme.altText,
    '&:hover': {
      background: Theme.brightHover,
    },
  },
  hostLink: {
    display: 'inline-block',
    textDecoration: 'none',
    color: Theme.primaryText,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  title: string;
  eventID: string;
  communityName?: string;
  communityID?: string;
  summary: string;
  description: string;
  timestamp: string;
  eventBanner: string;
  mutualSignups: number;
  rsvpYes: boolean;
  style?: any;
  complete?: boolean;
};

function Event(props: Props) {
  const styles = useStyles();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullEvent, setShowFullEvent] = useState(true);

  const descriptionSubstr = props.description.substr(0, MAX_SUBSTR_LEN);

  function handleShowMoreClick() {
    setShowFullDesc(!showFullDesc);
  }

  function renderEventHeader() {
    return (
      <div className={styles.top}>
        <RSLink href={`/event/${props.eventID}`} className={styles.eventName}>
          <RSText type="head" color={Theme.secondaryText} bold size={16}>
            {props.title}
          </RSText>
        </RSLink>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <RSText color={Theme.secondaryText}>{props.timestamp}</RSText>
          <IconButton
            onClick={() => {
              setShowFullEvent(!showFullEvent);
            }}
          >
            {showFullEvent ? (
              <BsChevronDown color={Theme.secondaryText} size={14} />
            ) : (
              <BsChevronRight color={Theme.secondaryText} size={14} />
            )}
          </IconButton>
        </div>
      </div>
    );
  }

  function renderEventBody() {
    return (
      <div className={styles.bodyWrapper}>
        <RSLink
          href={
            props.communityID
              ? `/community/${props.communityID}`
              : '/community/5f713f1870443b1485235491' //ROOTSHARE TEAM COMMUNITY ID
          }
          className={styles.hostLink}
        >
          <RSText type="subhead" color={Theme.secondaryText} size={14}>
            Hosted by {props.communityName || 'RootShare'}
          </RSText>
        </RSLink>
        <RSLink href={`/event/${props.eventID}`} className={styles.hostLink}>
          <img
            src={props.eventBanner || RootSharePreviewBanner}
            className={styles.banner}
          />
        </RSLink>
        <RSText
          type="body"
          bold
          size={14}
          color={Theme.secondaryText}
          className={styles.summary}
        >
          {props.summary}
        </RSText>
        <RSText type="body" size={13} color={Theme.secondaryText}>
          {showFullDesc || descriptionSubstr === props.description
            ? props.description
            : descriptionSubstr.concat(' ...')}
        </RSText>
        {props.description !== descriptionSubstr ? (
          <div className={styles.seeMoreButtonDiv}>
            <Button className={styles.seeMoreButton} onClick={handleShowMoreClick}>
              See {showFullDesc ? 'less' : 'more'}
            </Button>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}></div>
        )}

        <div className={styles.bottom}>
          <RSText type="body" color={Theme.primaryText} size={13}>
            {props.mutualSignups !== 0 &&
              `${props.mutualSignups} Connections Signed Up`}
          </RSText>
          <Button
            href={`/event/${props.eventID}`}
            variant="contained"
            className={styles.goToEventButton}
          >
            {props.complete ? 'Watch Again' : 'Enter Event'}
          </Button>
          {/* <Button variant="contained" className={styles.rsvpButton}>
            RSVP YES
          </Button> */}
        </div>
      </div>
    );
  }

  return (
    <Box
      boxShadow={2}
      borderRadius={10}
      className={[styles.box, props.style].join(' ')}
    >
      <div className={styles.wrapper}>
        {renderEventHeader()}
        {showFullEvent && renderEventBody()}
      </div>
    </Box>
  );
}

export default Event;
