import React, { useState } from 'react';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { makeStyles } from '@material-ui/core/styles';
import { IoIosArrowForward } from 'react-icons/io';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    height: '70px',
    background: colors.secondary,
    paddingBottom: 4,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: colors.primaryText,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {},
  right: {},
  picture: {
    margin: 10,
    marginTop: 18,
    marginBottom: -7,
    display: 'inline-block',
    color: colors.primaryText,
  },
  message: {
    marginLeft: 54,
    color: 'gray',
    marginTop: 10,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '250px',
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
  arrow: {
    margin: 1.5,
    marginTop: 27,
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
  conversation: any;
  selectConversation: (conversation: any) => void;
};

function SingleConversation(props: Props) {
  const styles = useStyles();

  function joinUserNames(users: any, delimiter: string) {
    let joinedString = '';

    let firstFlag = false;
    for (let i = 0; i < users.length; i++) {
      const currUser = users[i];
      const currName = currUser.firstName;

      if (currUser._id !== props.user._id) {
        if (firstFlag) joinedString += delimiter;
        joinedString += currName;
        firstFlag = true;
      }
    }

    return joinedString;
  }

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

  const conversationTimeStamp = getConversationTime(
    new Date(
      props.conversation.lastMessage !== undefined
        ? props.conversation.lastMessage.timeCreated
        : props.conversation.timeCreated
    )
  );

  return (
    <div
      className={styles.wrapper}
      onClick={() => props.selectConversation(props.conversation)}
    >
      <div className={styles.top}>
        <div>
          <EmojiEmotionsIcon className={styles.picture} />
          <RSText bold size={12} className={styles.name}>
            {joinUserNames(props.conversation.participants, ', ')}
          </RSText>
        </div>

        <IoIosArrowForward
          size={18}
          color={colors.secondaryText}
          className={styles.arrow}
        />
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <RSText size={12} className={styles.message}>
            {props.conversation.lastMessage?.content}
          </RSText>
        </div>

        <RSText size={10} className={styles.timeStamp}>
          {conversationTimeStamp}
        </RSText>
      </div>
    </div>
  );
}

export default SingleConversation;
