import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { IconButton } from '@material-ui/core';

import { BsChevronDown, BsChevronRight } from 'react-icons/bs';

import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';
import BabyBoilersBanner from '../../images/PurdueHypeAlt.png';

const MAX_SUBSTR_LEN = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.secondary,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
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
    color: colors.secondaryText,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    background: colors.bright,
    color: colors.primaryText,
  },
}));

type Props = {};

function Event(props: Props) {
  const styles = useStyles();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullEvent, setShowFullEvent] = useState(true);

  const description = `Robbie Hummel, Ja\'Juan Johnson, and E\'Twaun Moore will talk about their
  experiences post-graduation. Robbie has played in the NBA for a season or
  two, and played overseas for multiple. He is involved with startups now.
  Ja'\Juan has done the same, and is involved with startups now. E\'Twaun is
  currently on the New Orleans Pelicans and is having great success. The first
  45 minutes will be dedicated to the three talking about their experiences.
  The remaining 15 minutes will be dedicated to questions from the fans.`;

  const descriptionSubstr = description.substr(0, MAX_SUBSTR_LEN);

  function handleShowMoreClick() {
    setShowFullDesc(!showFullDesc);
  }

  function renderEventBody() {
    return (
      <>
        <a href="/community/testID">
          <RSText type="subhead" color={colors.primaryText} size={14}>
            Hosted by RootShare
          </RSText>
        </a>
        <img src={BabyBoilersBanner} className={styles.banner} />
        <RSText
          type="body"
          bold
          size={14}
          color={colors.primaryText}
          className={styles.summary}
        >
          Robbie Hummel, Ja'Juan Johnson, and E'Twaun Moore return to talk about what
          they have been up to since their time at Purdue
        </RSText>
        <RSText type="body" size={12} color={colors.primaryText}>
          {showFullDesc && descriptionSubstr !== description
            ? description
            : descriptionSubstr.concat(' ...')}
        </RSText>
        <div className={styles.seeMoreButtonDiv}>
          <Button className={styles.seeMoreButton} onClick={handleShowMoreClick}>
            See {showFullDesc ? 'less' : 'more'}
          </Button>
        </div>
        <div className={styles.bottom}>
          <RSText type="body" color={colors.secondaryText} size={13}>
            98 Connections Signed Up
          </RSText>
          <Button variant="contained" className={styles.rsvpButton}>
            RSVP YES
          </Button>
        </div>
      </>
    );
  }

  function renderEventHeader() {
    return (
      <div className={styles.top}>
        <RSText type="head" color={colors.primaryText} bold size={16}>
          The Baby Boilers Are Back
        </RSText>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <RSText color={colors.secondaryText} italic>
            August 14, 2020 7:00 PM
          </RSText>
          <IconButton
            onClick={() => {
              setShowFullEvent(!showFullEvent);
            }}
          >
            {showFullEvent ? (
              <BsChevronDown color={colors.primaryText} size={14} />
            ) : (
              <BsChevronRight color={colors.primaryText} size={14} />
            )}
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {renderEventHeader()}
      {showFullEvent && renderEventBody()}
    </div>
  );
}

export default Event;
