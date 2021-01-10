import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { MessageType } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    alignSelf: 'flex-start',
    width: '80%',
    background: Theme.white,
  },
  message: {
    color: Theme.altText,
    marginTop: 2,
    marginBottom: 5,
    padding: 5,
    float: 'left',
    background: Theme.primary,
    marginLeft: 5,
    borderStyle: 'solid',
    borderColor: 'gray',
    borderRadius: 7,
    borderWidth: '2px',
    wordWrap: 'break-word',
    maxWidth: 300,
  },
  senderName: {
    display: 'inline-block',
    color: 'gray',
    marginLeft: 10,
    marginTop: -5,
    marginBottom: 2,
    wordWrap: 'break-word',
    maxWidth: 300,
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
  message: MessageType;
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
