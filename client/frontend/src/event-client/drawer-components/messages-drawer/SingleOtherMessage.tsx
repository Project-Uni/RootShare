import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    float: 'left',
    width: '80%',
    background: colors.secondary,
  },
  message: {
    marginRight: 54,
    color: colors.primaryText,
    marginTop: 2,
    marginBottom: 5,
    padding: 5,
    float: 'left',
    background: colors.primary,
    marginLeft: 5,
    borderStyle: 'solid',
    borderColor: 'gray',
    borderRadius: 7,
    borderWidth: '2px',
  },
  senderName: {
    display: 'inline-block',
    // borderStyle: 'solid',
    color: 'gray',
    marginLeft: 10,
    marginTop: -5,
    marginBottom: 2,
  },
  timeStamp: {
    textAlign: 'right',
    marginTop: 10,
    marginRight: 25,
    color: 'gray',
  },
}));

type Props = {
  user: any;
  message: any;
  senderName: string;
};

function SingleOtherMessage(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      {props.senderName !== '' ? (
        <RSText size={10} className={styles.senderName}>
          {props.senderName}
        </RSText>
      ) : null}
      {props.senderName !== '' ? <br /> : null}
      <RSText size={12} className={styles.message}>
        {props.message.content}
      </RSText>
    </div>
  );
}

export default SingleOtherMessage;
