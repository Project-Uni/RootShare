import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RSText from '../../../../base-components/RSText';
import { IconButton, Modal, LinearProgress } from '@material-ui/core';
import { colors } from '../../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
    borderRadius: 5,
    outline: 'none',
  },

  top: {
    textAlign: 'left',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
    marginLeft: 15,
    marginRight: 15,
  },
  helperText: {
    marginLeft: 15,
    marginRight: 15,
  },
  linearProgress: {
    backgroundColor: colors.second,
  },
  linearProgressBg: {
    backgroundColor: 'lightgrey',
  },
  linearProgressRoot: {
    height: 5,
  },
}));

type Props = {
  open: boolean;
  className?: string;
  title: string;
  helperText?: string;
  helperIcon?: JSX.Element;
  loadingIndicator?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  onClose: () => any;
};

function RSModal(props: Props) {
  const styles = useStyles();
  return (
    <Modal
      open={props.open}
      disableEnforceFocus
      disableAutoFocus
      onClose={props.onClose}
    >
      <div
        className={[styles.wrapper, props.className].join(' ')}
        style={{
          position: 'absolute',
          top: `${50}%`,
          left: `${50}%`,
          transform: `translate(-${50}%, -${50}%)`,
        }}
      >
        {props.loadingIndicator && (
          <LinearProgress
            classes={{
              root: styles.linearProgressRoot,
              barColorPrimary: styles.linearProgress,
              colorPrimary: styles.linearProgressBg,
            }}
            variant={props.loading ? 'indeterminate' : 'determinate'}
            value={100}
          />
        )}
        <div className={styles.top}>
          <RSText type="head" size={15} bold>
            {props.title}
          </RSText>
          <IconButton onClick={props.onClose} size="medium">
            X
          </IconButton>
        </div>
        {props.helperIcon && (
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            {props.helperIcon}
          </div>
        )}
        {props.helperText && (
          <RSText
            type="subhead"
            className={styles.helperText}
            size={12}
            italic
            color={colors.secondaryText}
          >
            {props.helperText}
          </RSText>
        )}
        {props.children}
      </div>
    </Modal>
  );
}

export default RSModal;
