import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { connect } from 'react-redux';

import { EventType, HostType } from '../../helpers/types';
import { monthDict } from '../../helpers/constants';
import { formatTime, makeRequest } from '../../helpers/functions';

import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
    // not final color
    borderRadius: 5,
    paddingBottom: 4,
    margin: 10,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.bright,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    //borderRadius: 10,
  },
  left: {
    color: colors.secondary,
    marginTop: 30,
    marginRight: 10,
  },
  right: {},
  picture: {
    margin: 10,
    marginTop: 18,
    marginBottom: -7,
    display: 'inline-block',
    color: colors.secondary,
  },
  organization: {
    marginLeft: 54,
    color: colors.secondary,
    marginTop: 30,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: 0,
    //Questionable decision by me here below, but lets go with it for now
    marginTop: -20,
  },
  name: {
    marginRight: 4,
    marginBottom: 10,
    marginTop: -50,
    marginLeft: 10,
    display: 'inline-block',
    color: colors.primaryText,
  },
  date: {
    alignRight: 5,
    marginTop: 12,
    marginRight: 10,
    display: 'inline-block',
    color: colors.primaryText,
  },
  RSVPIcon: {
    marginRight: -5,
    color: colors.primaryText,
    marginBottom: 0,
  },
  banner: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
  },
  description: {
    marginTop: -15,
    marginBottom: 5,
  },
}));

type Props = {
  user: { [key: string]: any };
  event: EventType;
  accessToken: string;
  refreshToken: string;
};

function SingleEvent(props: Props) {
  const styles = useStyles();
  const [RSVP, setRSVP] = useState(false);

  useEffect(() => {
    if (props.event.userRSVP !== undefined && props.event.userRSVP !== null)
      setRSVP(props.event.userRSVP);
  }, [props.event.userRSVP]);

  async function toggleRSVP() {
    const oldRSVP = RSVP;
    setRSVP(!oldRSVP);

    const { data } = await makeRequest(
      'POST',
      '/api/webinar/updateRSVP',
      {
        webinarID: event._id,
        didRSVP: !oldRSVP,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setRSVP(data['content']['newRSVP']);
  }

  const { event } = props;
  const eventTime = new Date(event.dateTime);
  const host: HostType = event.host as HostType;
  const hideRSVPToggle = event.userSpeaker || host._id === props.user._id;
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          {hideRSVPToggle ? (
            <IconButton disabled={true}>
              <FiberManualRecordIcon className={styles.RSVPIcon} />
            </IconButton>
          ) : (
            <IconButton>
              {RSVP ? (
                <RemoveCircleOutlineIcon
                  onClick={toggleRSVP}
                  className={styles.RSVPIcon}
                />
              ) : (
                <AddCircleOutlineIcon
                  onClick={toggleRSVP}
                  className={styles.RSVPIcon}
                />
              )}
            </IconButton>
          )}

          <RSText bold size={12} className={styles.name}>
            {event.title}
          </RSText>
        </div>
        <div>
          <RSText size={12} className={styles.date}>
            {monthDict[eventTime.getMonth()]} {eventTime.getDate()}
          </RSText>
        </div>
      </div>
      <div className={styles.bottom}>
        <div>
          <RSText size={12} className={styles.organization}>
            Hosted by{' '}
            {event.hostCommunity
              ? event.hostCommunity
              : `${host.firstName} ${host.lastName}`}
          </RSText>
        </div>
        <div>
          <RSText size={12} className={styles.left}>
            {formatTime(eventTime)}
          </RSText>
        </div>
      </div>
      <div className={styles.description}>
        <div>
          <RSText size={12} className={styles.organization}>
            {event.brief_description}
          </RSText>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleEvent);
