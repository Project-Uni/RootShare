import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import ProfilePicture from '../../../base-components/ProfilePicture';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    borderTop: `1px solid ${colors.background}`,
    paddingTop: 10,
    paddingBottom: 10,
    '&:hover': {
      background: colors.background
    }
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
    '&:hover': {
      textDecoration: 'none',
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
        <ProfilePicture height={40} width={40} borderRadius={40} _id={props.userID} type='profile' currentPicture={props.profilePicture} />
        <div className={styles.commentBody}>
          <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
            <RSText type="body" size={12} color={colors.secondary} bold>
              {props.name}
            </RSText>
          </a>
          <RSText type="body" size={10} color={colors.secondaryText}>
            {props.timestamp}
          </RSText>
          <RSText type="body" size={12} color={colors.secondary}>
            {props.message}
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default Comment;
