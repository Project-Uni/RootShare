import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, IconButton } from '@material-ui/core';

import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { EventType, HostType, ProfileState } from '../../../helpers/types';
import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';

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
    paddingBottom: 3,
    paddingLeft: 10,
    paddingRight: 10,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  eventTime: {
    marginTop: -7,
    marginBottom: 10,
  },
  right: {
    marginRight: 30,
  },
  removeButton: {
    color: colors.error,
    background: colors.primaryText,
    height: 30,
  },
  descriptions: {
    color: colors.secondaryText,
    marginTop: 4,
    marginBottom: 6,
  },
  navigationText: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  profileID: string;
  event: EventType;
  style?: any;
  accessToken: string;
  refreshToken: string;
  currentProfileState: ProfileState;
  removeEvent: (eventID: string) => void;
};

function ProfileEvent(props: Props) {
  const styles = useStyles();

  const [showEventDetails, setShowEventDetails] = useState(false);

  const eventDateTime = new Date(props.event.dateTime);
  const eventDate = formatDatePretty(eventDateTime); //Aug 14, 2020
  const eventTime = formatTime(eventDateTime);
  const host = props.event.host as HostType;
  let participationType: 'ATTENDEE' | 'SPEAKER' | 'HOST' = 'ATTENDEE';
  if (props.event.userSpeaker) participationType = 'SPEAKER';
  if (host._id === props.profileID) participationType = 'HOST';

  function toggleEventDetails() {
    setShowEventDetails(!showEventDetails);
  }

  async function removeEvent() {
    props.removeEvent(props.event._id);

    const { data } = await makeRequest(
      'POST',
      '/api/webinar/updateRSVP',
      {
        webinarID: props.event._id,
        didRSVP: false,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    console.log(data);
  }

  function renderDetails() {
    return (
      <div className={styles.detailsWrapper}>
        <div className={styles.left}>
          <RSText
            type="body"
            size={11}
            italic
            color={colors.secondaryText}
            className={styles.eventTime}
          >
            @ {eventTime}
          </RSText>

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
        {/* --- Hiding this for now because removing RSVP/Attended isn't well-defined yet

        {props.currentProfileState === 'SELF' && (
          <div className={styles.right}>
            {participationType === 'ATTENDEE' && (
              <Button className={styles.removeButton} onClick={removeEvent}>
                REMOVE
              </Button>
            )}
          </div>
        )} */}
      </div>
    );
  }

  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <div className={styles.compactWrapper}>
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
          <a href={`/event/${props.event._id}`} className={styles.navigationText}>
            <RSText
              type="body"
              size={12}
              bold
              color={colors.second}
              className={styles.eventTitle}
            >
              {props.event.title}
            </RSText>
          </a>
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
