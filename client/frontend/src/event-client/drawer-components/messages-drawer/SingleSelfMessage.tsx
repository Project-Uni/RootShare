import React, { useState } from 'react';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import { IoIosArrowForward } from 'react-icons/io';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    float: 'right',
    width: '80%',
    background: colors.secondary,
  },
  message: {
    marginLeft: 54,
    color: colors.primaryText,
    marginTop: 2,
    marginBottom: 5,
    padding: 5,
    float: 'right',
    background: colors.primary,
    marginRight: 5,
    borderStyle: 'solid',
    borderColor: 'gray',
    borderRadius: 7,
    borderWidth: '2px',
  },
  timeStamp: {
    textAlign: 'right',
    marginTop: 10,
    marginRight: 25,
    color: 'gray',
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
  user: any;
  message: any;
};

function SingleSelfMessage(props: Props) {
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

  function getConversationTime(date: Date) {
    const now = new Date();
    const messageYear = date.getFullYear();
    const messageMonth = date.getMonth();
    const messageDate = date.getDate();
    const currDate = now.getDate();
    if (messageYear !== now.getFullYear()) return messageYear;
    else if (messageMonth !== now.getMonth()) return monthDict[messageMonth];
    else if (currDate - messageDate >= 7) return `${messageMonth}/${messageDate}`;
    else if (currDate - messageDate > 1) return weekDict[date.getDay()];
    else if (messageDate !== currDate) return 'Yesterday';
    else return formatTime(date);
  }

  return (
    <div className={styles.wrapper}>
      <RSText size={12} className={styles.message}>
        {props.message.content}
      </RSText>
    </div>
  );
}

export default SingleSelfMessage;
