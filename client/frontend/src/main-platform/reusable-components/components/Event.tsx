import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Box } from '@material-ui/core';
import { IconButton } from '@material-ui/core';

import { BsChevronDown, BsChevronRight } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import BabyBoilersBanner from '../../../images/PurdueHypeAlt.png';
import BoudreauxEventPicture from '../../../images/banners/BoudreauxEventPicture.jpeg';

const MAX_SUBSTR_LEN = 200;

const useStyles = makeStyles((_: any) => ({
  box: {
    background: colors.primaryText,
  },
  wrapper: {
    marginLeft: 1,
    marginRight: 1,
    borderRadius: 1,
    textAlign: 'left',
    padding: 15,
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
    color: colors.fourth,
    marginRight: -9,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    background: colors.bright,
    color: colors.primaryText,
  },
  goToEventButton: {
    background: colors.bright,
    color: colors.primaryText,
  },
  hostLink: {
    display: 'inline-block',
    textDecoration: 'none',
    color: colors.primaryText,
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
        <a href={`/event/${props.eventID}`} className={styles.eventName}>
          <RSText type="head" color={colors.second} bold size={16}>
            {props.title}
          </RSText>
        </a>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <RSText color={colors.fourth}>{props.timestamp}</RSText>
          <IconButton
            onClick={() => {
              setShowFullEvent(!showFullEvent);
            }}
          >
            {showFullEvent ? (
              <BsChevronDown color={colors.second} size={14} />
            ) : (
              <BsChevronRight color={colors.second} size={14} />
            )}
          </IconButton>
        </div>
      </div>
    );
  }

  function renderEventBody() {
    return (
      <>
        <a
          href={props.communityID ? `/community/${props.communityID}` : undefined}
          className={styles.hostLink}
        >
          <RSText type="subhead" color={colors.second} size={14}>
            Hosted by {props.communityName || 'RootShare'}
          </RSText>
        </a>
        <a href={`/event/${props.eventID}`} className={styles.hostLink}>
          <img
            src={
              props.eventID === '5f89f333821f7f6046243a53'
                ? BoudreauxEventPicture
                : BabyBoilersBanner
            }
            className={styles.banner}
          />
        </a>
        <RSText
          type="body"
          bold
          size={14}
          color={colors.second}
          className={styles.summary}
        >
          {props.summary}
        </RSText>
        <RSText type="body" size={13} color={colors.second}>
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
          <RSText type="body" color={colors.fourth} size={13}>
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
      </>
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
