import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../theme/Colors';
import RSText from '../../base-components/RSText';
import { Button } from '@material-ui/core';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 15,
    borderBottom: `1px solid ${colors.secondaryText}`,
    paddingBottom: 15,
  },
  singlePersonWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  textContainer: {
    marginLeft: 10,
  },
  personLink: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  removeButton: {
    color: colors.primaryText,
    background: colors.secondary,
    marginRight: 7,
  },
  connectButton: {
    color: colors.primaryText,
    background: colors.bright,
    marginLeft: 7,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 7,
  },
}));

type Props = {
  name: string;
  profilePic: any;
  position: string;
  company: string;
  mutualConnections: number;
  onRemove: (key: any) => any;
  onConnect: (key: any) => any;
  _id: string;
};

function Template(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div className={styles.singlePersonWrapper}>
        <a href={`/profile/${props._id}`} className={styles.personLink}>
          <img src={props.profilePic} style={{ height: 50, borderRadius: 50 }} />
        </a>
        <div className={styles.textContainer}>
          <a href={`/profile/${props._id}`} className={styles.personLink}>
            <RSText type="body" color={colors.primaryText} size={13}>
              {props.name}
            </RSText>
          </a>
          <RSText type="body" color={colors.secondaryText} italic size={11}>
            {props.position},{' ' + props.company}
          </RSText>
          <RSText type="body" color={colors.secondaryText} size={10} italic>
            {props.mutualConnections} Mutual Connections
          </RSText>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <Button
          className={styles.removeButton}
          size="small"
          onClick={props.onRemove}
        >
          Remove
        </Button>
        <Button
          className={styles.connectButton}
          size="small"
          onClick={props.onConnect}
        >
          Connect
        </Button>
      </div>
    </div>
  );
}

export default Template;
