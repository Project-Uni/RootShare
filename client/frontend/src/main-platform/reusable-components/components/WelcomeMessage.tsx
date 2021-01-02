import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

const useStyles = makeStyles((_: any) => ({
  welcomeMessage: {
    borderRadius: 1,
    marginLeft: 1,
    marginRight: 1,
    marginTop: 1,
    paddingBottom: 15,
  },
  closeWelcomeButtonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  welcomeTextContainer: {
    marginLeft: 20,
    marginRight: 20,
    paddingTop: 30,
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
  counter?: number;
  buttonText?: string;
  buttonAction?: () => any;
};

function WelcomeMessage(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.welcomeMessage}>
      <div className={styles.welcomeTextContainer}>
        <RSText 
          type="other"
          size={10}
          
          color={colors.secondaryText}
          >
          {props.counter}
        </RSText>
        <RSText
          type="head"
          size={24}
          color={colors.secondary}
          bold>
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
