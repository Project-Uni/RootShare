import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';

import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';
import { monthDict } from '../../helpers/constants';
import { cropText } from '../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
    borderRadius: 5,
    paddingBottom: 4,
    margin: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.primary,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderRadius: 10,
  },
  right: {
    marginTop: 30,
    marginRight: 10,
  },
  host: {
    marginLeft: 10,
    marginTop: 30,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: 0,
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
  },
  description: {
    marginLeft: 10,
    color: colors.secondary,
    marginTop: 10,
    paddingTop: 10,
    borderTopStyle: 'solid',
    borderTopColor: 'gray',
    borderTopWidth: 2,
  },
}));

type Props = {
  event: any;
  handleEdit: (event: any) => void;
};

function AdminSingleEvent(props: Props) {
  const styles = useStyles();

  function formatTime(date: Date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let minutesString = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutesString + ' ' + ampm;

    return strTime;
  }

  function formatYear(date: Date) {
    let year = date.getFullYear().toString();
    return `'${year.slice(2)}`;
  }

  const { event } = props;
  const dateTime: Date =
    event.dateTime === undefined ? new Date('04/22/1998') : new Date(event.dateTime);
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <IconButton onClick={() => props.handleEdit(props.event)}>
            <RSText size={11} color={colors.primaryText}>
              Edit
            </RSText>
          </IconButton>
          <RSText bold size={12} color={colors.primaryText} className={styles.name}>
            {cropText(event.title, 26)}
          </RSText>
        </div>
        <div>
          <RSText size={12} color={colors.primaryText} className={styles.date}>
            {monthDict[dateTime.getMonth()]} {dateTime.getDate()}{' '}
            {formatYear(dateTime)}
          </RSText>
        </div>
      </div>
      <div className={styles.bottom}>
        <div>
          <RSText size={12} className={styles.host}>
            Hosted by {`${event.host?.firstName} ${event.host?.lastName}`}
          </RSText>
        </div>
        <div>
          <RSText size={12} className={styles.right}>
            {formatTime(dateTime)}
          </RSText>
        </div>
      </div>
      <RSText size={12} className={styles.description}>
        {event.brief_description}
      </RSText>
    </div>
  );
}

export default AdminSingleEvent;
