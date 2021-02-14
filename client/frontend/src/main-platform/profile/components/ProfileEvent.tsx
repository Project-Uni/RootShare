import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, IconButton } from '@material-ui/core';

import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';

import { EventType, HostType, UserToUserRelationship } from '../../../helpers/types';
import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  compactWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    background: Theme.white,
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
    color: Theme.error,
    background: Theme.white,
    height: 30,
  },
  descriptions: {
    color: Theme.white,
    marginTop: 4,
    marginBottom: 6,
  },
  navigationText: {
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  profileID: string;
  event: EventType;
  style?: any;
  currentProfileState: UserToUserRelationship;
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

    const { data } = await makeRequest('POST', '/api/webinar/updateRSVP', {
      webinarID: props.event._id,
      didRSVP: false,
    });

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
            color={Theme.primary}
            className={styles.eventTime}
          >
            @ {eventTime}
          </RSText>

          <RSText
            type="body"
            size={12}
            color={Theme.dark}
            className={styles.descriptions}
          >
            {props.event.brief_description}
          </RSText>

          <RSText
            type="body"
            size={12}
            color={Theme.dark}
            className={styles.descriptions}
          >
            {props.event.full_description}
          </RSText>
        </div>
        {/* --- Hiding this for now because removing RSVP/Attended isn't well-defined yet

        {props.currentProfileState === U2UR.SELF && (
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
          <RSText type="body" size={11} italic color={Theme.secondaryText}>
            {eventDate}
          </RSText>
          <a href={`/event/${props.event._id}`} className={styles.navigationText}>
            <RSText
              type="body"
              size={12}
              bold
              color={Theme.primaryText}
              className={styles.eventTitle}
            >
              {props.event.title}
            </RSText>
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RSText type="body" size={12} color={Theme.primaryText}>
            {participationType}
          </RSText>
          <IconButton onClick={toggleEventDetails}>
            {showEventDetails ? (
              <BsChevronUp size={12} color={Theme.secondaryText} />
            ) : (
              <BsChevronDown size={12} color={Theme.secondaryText} />
            )}
          </IconButton>
        </div>
      </div>
      {showEventDetails && renderDetails()}
    </div>
  );
}

export default ProfileEvent;
