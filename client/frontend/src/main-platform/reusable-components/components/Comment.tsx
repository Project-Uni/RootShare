import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    borderBottom: `1px solid ${colors.secondaryText}`,
    paddingTop: 10,
    paddingBottom: 10,
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
  profilePicture: any;
};

function Comment(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div className={styles.commentMainArea}>
        <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
          <img src={props.profilePicture} className={styles.commentProfile} />
        </a>
        <div className={styles.commentBody}>
          <a href={`/profile/${props.userID}`} className={styles.noUnderline}>
            <RSText type="body" size={12} color={colors.primaryText} bold>
              {props.name}
            </RSText>
          </a>
          <RSText type="body" size={10} color={colors.secondaryText} italic>
            {props.timestamp}
          </RSText>
          <RSText type="body" size={12} color={colors.primaryText}>
            {props.message}
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default Comment;
