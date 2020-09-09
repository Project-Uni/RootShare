import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { colors } from '../../../theme/Colors';
import ProfilePicture from '../../../base-components/ProfilePicture';
import RSText from '../../../base-components/RSText';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  right: {},
  acceptButton: {
    background: colors.bright,
    color: colors.primaryText,
    marginLeft: 15,
  },
  name: {
    marginLeft: 15,
  },
  noDecoration: {
    textDecoration: 'none',
    color: colors.primary,
  },
}));

type Props = {
  firstName: string;
  lastName: string;
  _id: string;
  profilePicture?: string;
  className?: string;
  onAccept: (_id: string) => any;
  onReject: (_id: string) => any;
};

function SinglePendingMember(props: Props) {
  const styles = useStyles();

  return (
    <div className={[styles.wrapper, props.className].join(' ')}>
      <div className={styles.left}>
        <a href={`/profile/${props._id}`}>
          <ProfilePicture
            height={60}
            width={60}
            borderRadius={50}
            type="profile"
            currentPicture={props.profilePicture}
          />
        </a>
        <a href={`/profile/${props._id}`} className={styles.noDecoration}>
          <RSText type="body" size={14} className={styles.name}>
            {props.firstName} {props.lastName}
          </RSText>
        </a>
      </div>
      <div className={styles.right}>
        <Button
          size="small"
          onClick={() => {
            props.onReject(props._id);
          }}
        >
          Reject
        </Button>
        <Button
          size="small"
          className={styles.acceptButton}
          onClick={() => {
            props.onAccept(props._id);
          }}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}

export default SinglePendingMember;
