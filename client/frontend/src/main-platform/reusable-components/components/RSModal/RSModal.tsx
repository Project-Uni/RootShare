import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { IconButton, Modal, LinearProgress } from '@material-ui/core';
import { FiArrowLeft } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';

import RSText from '../../../../base-components/RSText';

import { colors } from '../../../../theme/Colors';
import Theme from '../../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
    borderRadius: 5,
    outline: 'none',
  },
  pageTitle: {
    marginLeft: 15,
    marginRight: 15,
  },
  top: {
    textAlign: 'left',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
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
  serverError: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 10,
    marginBottom: 10,
  },
}));

type Props = {
  open: boolean;
  className?: string;
  style?: React.CSSProperties;
  title: string;
  helperText?: string;
  helperIcon?: JSX.Element;
  loadingIndicator?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  onClose: () => any;
  onBackArrow?: () => void;
  serverErr?: string;
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
        className={[props.className, styles.wrapper].join(' ')}
        style={{
          position: 'absolute',
          top: `${50}%`,
          left: `${50}%`,
          transform: `translate(-${50}%, -${50}%)`,
          ...props.style,
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {props.onBackArrow && (
              <IconButton onClick={props.onBackArrow} size="medium">
                <FiArrowLeft color={Theme.secondaryText} />
              </IconButton>
            )}
            <RSText
              type="head"
              size={15}
              bold
              className={props.onBackArrow ? undefined : styles.pageTitle}
            >
              {props.title}
            </RSText>
          </div>
          <IconButton onClick={props.onClose} size="medium">
            <MdClose />
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
            color={Theme.secondaryText}
          >
            {props.helperText}
          </RSText>
        )}
        {props.serverErr && props.serverErr.length !== 0 && (
          <RSText italic color={Theme.error} className={styles.serverError}>
            {props.serverErr}
          </RSText>
        )}
        {props.children}
      </div>
    </Modal>
  );
}

export default RSModal;
