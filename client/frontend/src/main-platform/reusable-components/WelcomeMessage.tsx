import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { IconButton, Button } from '@material-ui/core';

import { IoMdClose } from 'react-icons/io';

import { colors } from '../../theme/Colors';
import RSText from '../../base-components/RSText';

const useStyles = makeStyles((_: any) => ({
  welcomeMessage: {
    background: colors.secondary,
    borderRadius: 10,
    margin: 20,
    paddingBottom: 15,
  },
  closeWelcomeButtonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  welcomeTextContainer: {
    marginLeft: 20,
    marginRight: 20,
  },
  welcomeBrief: {
    marginTop: 15,
    marginBottom: 25,
  },
  discoverButton: {
    background: colors.bright,
    color: 'white',
    fontSize: 14,
    paddingLeft: 30,
    paddingRight: 30,
    '&:hover': {
      background: colors.ternary,
    },
  },
}));

type Props = {
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
  buttonAction?: () => any;
};

function WelcomeMessage(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.welcomeMessage}>
      <div className={styles.closeWelcomeButtonDiv}>
        <IconButton onClick={props.onClose}>
          <IoMdClose size={24} color={colors.secondaryText} />
        </IconButton>
      </div>

      <div className={styles.welcomeTextContainer}>
        <RSText type="head" size={24} color={colors.primaryText} bold>
          {props.title}
        </RSText>
        <RSText
          type="subhead"
          size={14}
          color={colors.secondaryText}
          className={styles.welcomeBrief}
        >
          {props.message}
        </RSText>
        {props.buttonText && (
          <Button className={styles.discoverButton} onClick={props.buttonAction}>
            {props.buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}

export default WelcomeMessage;
