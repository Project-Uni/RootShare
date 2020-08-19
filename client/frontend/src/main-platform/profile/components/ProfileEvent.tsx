import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, IconButton } from '@material-ui/core';

import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { EventType, HostType } from '../../../helpers/types';
import { formatDatePretty } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  compactWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.primaryText,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 10,
    paddingRight: 10,
  },
  eventTitle: {
    marginLeft: 10,
  },
  detailsWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 40,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  right: {
    marginRight: 28,
  },
  removeButton: {
    background: colors.fifth,
    height: 30,
  },
  descriptions: {
    marginTop: 4,
    marginBottom: 6,
  },
}));

type Props = {
  profileID: string;
  event: EventType;
  style?: any;
};

function ProfileEvent(props: Props) {
  const styles = useStyles();

  const [showEventDetails, setShowEventDetails] = useState(false);

  const eventDate = formatDatePretty(new Date(props.event.dateTime)); //Aug 14, 2020
  const host = props.event.host as HostType;
  let participationType: 'ATTENDEE' | 'SPEAKER' | 'HOST' = 'ATTENDEE';
  if (props.event.userSpeaker) participationType = 'SPEAKER';
  if (host._id === props.profileID) participationType = 'HOST';

  function toggleEventDetails() {
    setShowEventDetails(!showEventDetails);
  }

  function renderDetails() {
    return (
      <div className={styles.detailsWrapper}>
        <div className={styles.left}>
          <RSText
            type="body"
            size={12}
            color={colors.second}
            className={styles.descriptions}
          >
            {props.event.brief_description}
          </RSText>

          <RSText
            type="body"
            size={12}
            color={colors.second}
            className={styles.descriptions}
          >
            {props.event.full_description}
          </RSText>
        </div>
        <div className={styles.right}>
          <Button className={styles.removeButton}>REMOVE</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={[styles.compactWrapper, props.style || null].join(' ')}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <RSText type="body" size={11} italic color={colors.secondaryText}>
            {eventDate}
          </RSText>
          <RSText
            type="body"
            size={12}
            bold
            color={colors.second}
            className={styles.eventTitle}
          >
            {props.event.title}
          </RSText>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RSText type="body" size={12} color={colors.second}>
            {participationType}
          </RSText>
          <IconButton onClick={toggleEventDetails}>
            {showEventDetails ? (
              <BsChevronUp size={12} color={colors.secondaryText} />
            ) : (
              <BsChevronDown size={12} color={colors.secondaryText} />
            )}
          </IconButton>
        </div>
      </div>
      {showEventDetails && renderDetails()}
    </div>
  );
}

export default ProfileEvent;
