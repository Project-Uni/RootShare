import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    borderTop: `1px solid ${Theme.background}`,
    paddingTop: 10,
    paddingBottom: 10,
    '&:hover': {
      background: Theme.primaryHover,
    },
  },
  commentProfile: {
    height: 40,
    borderRadius: 40,
  },
  commentMainArea: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  commentBody: {
    textAlign: 'left',
    marginLeft: 20,
  },
  noUnderline: {
    textDecoration: 'none',
    '&:visited': {
      color: 'inherit',
    },
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  userID: string;
  name: string;
  timestamp: string;
  message: string;
  profilePicture?: string;
};

function Comment(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div className={styles.commentMainArea}>
        <ProfilePicture
          height={40}
          width={40}
          borderRadius={40}
          _id={props.userID}
          type="profile"
          currentPicture={props.profilePicture}
        />
        <div className={styles.commentBody}>
          <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
            <RSText type="body" bold color={Theme.primaryText}>
              {props.name}
            </RSText>
          </a>
          <RSText type="body" size={10} color={Theme.secondaryText}>
            {props.timestamp}
          </RSText>
          <RSText type="body">{props.message}</RSText>
        </div>
      </div>
    </div>
  );
}

export default Comment;
