import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import { FaEllipsisH } from 'react-icons/fa';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RootShareLogoFullWhite from '../../images/RootShareLogoFullWhite.png';

import RSText from '../base-components/RSText';
import { colors } from '../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
    // not final color
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
  host: {
    marginLeft: 10,
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
  editText: {
    color: colors.primaryText,
  },
  ellipsis: {
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
    marginLeft: 10,
    color: colors.secondary,
    marginTop: 10,
    paddingTop: 10,
    // borderStyle: 'solid',
    borderTopStyle: 'solid',
    borderTopColor: 'gray',
    borderTopWidth: 2,
  },
}));

const monthDict = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const weekDict = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type Props = {
  eventID: string;
  eventName: string;
  eventDescription: string;
  host: string;
  dateTime: Date;
  picture: string;
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

  const dateTime: Date =
    props.dateTime === undefined ? new Date('04/22/1998') : new Date(props.dateTime);
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <div>
          <IconButton>
            {/* <AddCircleOutlineIcon className={styles.ellipsis} /> */}
            <RSText size={11} className={styles.editText}>
              Edit
            </RSText>
          </IconButton>
          <RSText bold size={12} className={styles.name}>
            {props.eventName}
          </RSText>
        </div>
        <div>
          <RSText size={12} className={styles.date}>
            {monthDict[dateTime.getMonth()]} {dateTime.getDate()}{' '}
            {formatYear(dateTime)}
          </RSText>
        </div>
      </div>
      <div className={styles.bottom}>
        <div>
          <RSText size={12} className={styles.host}>
            Hosted by {props.host}
          </RSText>
        </div>
        <div>
          <RSText size={12} className={styles.left}>
            {formatTime(dateTime)}
          </RSText>
        </div>
      </div>
      <RSText size={12} className={styles.description}>
        {props.eventDescription}
      </RSText>
    </div>
  );
}

export default AdminSingleEvent;
