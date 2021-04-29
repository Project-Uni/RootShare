import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { IoIosArrowForward } from 'react-icons/io';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { getConversationTime } from '../../../helpers/functions';
import { UserType, ConversationType, MessageType } from '../../../helpers/types';

import { GroupIcon } from '../../../images';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    width: '100%',
    height: '70px',
    background: Theme.white,
    paddingBottom: 4,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: Theme.primary,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  left: {
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginTop: 16,
    marginLeft: 15,
  },
  right: {
    display: 'flex',
    alignSelf: 'center',
  },
  top: {},
  bottom: {},
  picture: {
    marginTop: 3,
    marginLeft: 10,
  },
  name: {
    display: 'inline-block',
    color: Theme.primaryText,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '280px',
  },
  message: {
    color: Theme.secondaryText,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '240px',
    marginTop: 2,
  },
  arrow: {
    marginTop: 8,
  },
  timeStamp: {
    textAlign: 'right',
    color: Theme.secondaryText,
    marginTop: 16,
    marginRight: 5,
  },
}));

type Props = {
  user: UserType;
  conversation: ConversationType;
  selectConversation: (conversation: any) => void;
};

function SingleConversation(props: Props) {
  const styles = useStyles();

  const lastMessage = props.conversation.lastMessage as MessageType;
  const conversationTimeStamp = getConversationTime(
    new Date(
      !props.conversation.lastMessage
        ? props.conversation.createdAt
        : lastMessage.createdAt
    )
  );
  const conversationIcon =
    props.conversation.participants.length > 2
      ? GroupIcon
      : props.conversation.conversationPicture;

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

  return (
    <div
      className={styles.wrapper}
      onClick={() => props.selectConversation(props.conversation)}
    >
      <div className={styles.left}>
        <ProfilePicture
          type="profile"
          className={styles.picture}
          editable={false}
          height={40}
          width={40}
          borderRadius={40}
          currentPicture={conversationIcon}
        />
      </div>

      <div className={styles.center}>
        <RSText bold size={12} className={styles.name}>
          {joinUserNames(props.conversation.participants, ', ')}
        </RSText>
        <RSText size={12} className={styles.message}>
          {lastMessage?.content}
        </RSText>
      </div>

      <div className={styles.right}>
        <RSText size={10} className={styles.timeStamp}>
          {conversationTimeStamp}
        </RSText>
        <IoIosArrowForward
          size={18}
          color={Theme.secondaryText}
          className={styles.arrow}
        />
      </div>
    </div>
  );
}

export default SingleConversation;
