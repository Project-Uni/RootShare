import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { IconButton, Button } from '@material-ui/core';

import { IoMdClose } from 'react-icons/io';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

const useStyles = makeStyles((_: any) => ({
  welcomeMessage: {
    background: colors.secondary,
    borderRadius: 10,
    margin: 20,
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
    marginBottom: 30,
    '&:hover': {
      background: colors.ternary,
    },
  },
}));

type Props = {
  closeWelcomeMessage: () => void;
};

function WelcomeMessage(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.welcomeMessage}>
      <div className={styles.closeWelcomeButtonDiv}>
        <IconButton onClick={props.closeWelcomeMessage}>
          <IoMdClose size={24} color={colors.secondaryText} />
        </IconButton>
      </div>

      <div className={styles.welcomeTextContainer}>
        <RSText type="head" size={24} color={colors.primaryText} bold>
          Welcome to RootShare!
        </RSText>
        <RSText
          type="subhead"
          size={14}
          color={colors.secondaryText}
          className={styles.welcomeBrief}
        >
          Every success story is rooted in the support from a community. Join your
          communities or discover new ones today.
        </RSText>
        <Button className={styles.discoverButton}>Discover</Button>
      </div>
    </div>
  );
}

export default WelcomeMessage;
