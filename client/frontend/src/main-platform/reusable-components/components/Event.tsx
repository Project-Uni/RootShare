import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { IconButton } from '@material-ui/core';

import { BsChevronDown, BsChevronRight } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import BabyBoilersBanner from '../../../images/PurdueHypeAlt.png';

const MAX_SUBSTR_LEN = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
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
  hostLink: {
    textDecoration: 'none',
    color: colors.primaryText,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  title: string;
  communityName: string;
  communityID: string;
  summary: string;
  description: string;
  timestamp: string;
  mutualSignups: number;
  rsvpYes: boolean;
  style?: any;
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
        <RSText type="head" color={colors.second} bold size={16}>
          {props.title}
        </RSText>
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
        <a href={`/community/${props.communityID}`} className={styles.hostLink}>
          <RSText type="subhead" color={colors.second} size={14}>
            Hosted by {props.communityName}
          </RSText>
        </a>
        <img src={BabyBoilersBanner} className={styles.banner} />
        <RSText
          type="body"
          bold
          size={14}
          color={colors.second}
          className={styles.summary}
        >
          {props.summary}
        </RSText>
        <RSText type="body" size={12} color={colors.second}>
          {showFullDesc && descriptionSubstr !== props.description
            ? props.description
            : descriptionSubstr.concat(' ...')}
        </RSText>
        <div className={styles.seeMoreButtonDiv}>
          <Button className={styles.seeMoreButton} onClick={handleShowMoreClick}>
            See {showFullDesc ? 'less' : 'more'}
          </Button>
        </div>
        <div className={styles.bottom}>
          <RSText type="body" color={colors.fourth} size={13}>
            {props.mutualSignups} Connections Signed Up
          </RSText>
          <Button variant="contained" className={styles.rsvpButton}>
            RSVP YES
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      {renderEventHeader()}
      {showFullEvent && renderEventBody()}
    </div>
  );
}

export default Event;
