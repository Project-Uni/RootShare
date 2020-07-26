import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    float: 'right',
    width: '80%',
    background: colors.secondary,
  },
  message: {
    marginLeft: 54,
    color: colors.primaryText,
    marginTop: 2,
    marginBottom: 5,
    padding: 5,
    float: 'right',
    background: colors.primary,
    marginRight: 5,
    borderStyle: 'solid',
    borderColor: 'gray',
    borderRadius: 7,
    borderWidth: '2px',
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
};

function SingleSelfMessage(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <RSText size={12} className={styles.message}>
        {props.message.content}
      </RSText>
    </div>
  );
}

export default SingleSelfMessage;
