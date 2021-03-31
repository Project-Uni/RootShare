import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button, Icon } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import Theme from '../../../theme/Theme';

import { MdGroup } from 'react-icons/md';
import theme from '../../../theme/Theme';

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
    background: Theme.bright,
    color: 'white',
    fontSize: 14,
    paddingLeft: 30,
    paddingRight: 30,
    '&:hover': {
      background: Theme.brightHover,
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
        <RSText type="head" size={24} color={Theme.primaryText} bold>
          {props.title}
          {props.counter && props.counter !== 0 ? ` | ${props.counter}` : ''}
        </RSText>
        <RSText
          type="subhead"
          size={14}
          color={Theme.secondaryText}
          className={styles.welcomeBrief}
        >
          {props.message}
        </RSText>
        <RSText type="other" size={10} color={colors.secondaryText}></RSText>
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
