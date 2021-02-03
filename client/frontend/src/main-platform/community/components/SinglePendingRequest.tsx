import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { colors } from '../../../theme/Colors';
import ProfilePicture from '../../../base-components/ProfilePicture';
import RSText from '../../../base-components/RSText';
import Theme from '../../../theme/Theme';

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
    background: Theme.bright,
    color: Theme.altText,
    marginLeft: 15,
  },
  name: {
    marginLeft: 15,
  },
  noDecoration: {
    textDecoration: 'none',
    color: Theme.primary,
  },
}));

type Props = {
  name: string;
  _id: string;
  profilePicture?: string;
  className?: string;
  onAccept: (_id: string) => any;
  onReject: (_id: string) => any;
  type: 'user' | 'community';
  edgeID?: string;
};

function SinglePendingRequest(props: Props) {
  const styles = useStyles();

  return (
    <div className={[styles.wrapper, props.className].join(' ')}>
      <div className={styles.left}>
        <a href={`/${props.type === 'user' ? 'profile' : 'community'}/${props._id}`}>
          <ProfilePicture
            height={60}
            width={60}
            borderRadius={50}
            type="profile"
            currentPicture={props.profilePicture}
          />
        </a>
        <a
          href={`/${props.type === 'user' ? 'profile' : 'community'}/${props._id}`}
          className={styles.noDecoration}
        >
          <RSText type="body" size={14} className={styles.name}>
            {props.name}
          </RSText>
        </a>
      </div>
      <div className={styles.right}>
        <Button
          size="small"
          onClick={() => {
            props.onReject(props.type === 'user' ? props._id : props.edgeID!);
          }}
        >
          Reject
        </Button>
        <Button
          size="small"
          className={styles.acceptButton}
          onClick={() => {
            props.onAccept(props.type === 'user' ? props._id : props.edgeID!);
          }}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}

export default SinglePendingRequest;
