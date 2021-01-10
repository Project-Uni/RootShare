import React from 'react';
import { makeStyles, withStyles, Theme } from '@material-ui/core/styles';

import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Tooltip from '@material-ui/core/Tooltip';

import RSText from '../../../base-components/RSText';
import colors from '../../../theme/Theme';
import { MessageType } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    width: '80%',
    background: colors.white,
  },
  message: {
    color: colors.primaryText,
    marginTop: 2,
    marginBottom: 5,
    padding: 5,
    float: 'right',
    background: colors.white,
    marginRight: 5,
    borderStyle: 'solid',
    borderColor: 'gray',
    borderRadius: 7,
    borderWidth: '2px',
    wordWrap: 'break-word',
    maxWidth: 300,
  },
  timeStamp: {
    textAlign: 'right',
    marginTop: 10,
    marginRight: 25,
    color: 'gray',
  },
  errorIcon: {
    color: colors.error,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}));

const CustomTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: colors.error,
    boxShadow: theme.shadows[1],
    fontSize: 12,
  },
}))(Tooltip);

type Props = {
  user: any;
  message: MessageType;
};

function SingleSelfMessage(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <RSText size={12} className={styles.message}>
        {props.message.content}
      </RSText>
      <CustomTooltip title="There was an error sending this message">
        {props.message.error ? (
          <ErrorOutlineIcon className={styles.errorIcon} />
        ) : (
          <span />
        )}
      </CustomTooltip>
    </div>
  );
}

export default SingleSelfMessage;
