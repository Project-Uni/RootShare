import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import SingleConversation from './SingleConversation';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  conversationsHeader: {
    height: '25px',
    marginBottom: 20,
    marginTop: 20,
    margin: 'auto',
    display: 'inline-block',
    color: colors.primaryText,
  },
  conversationsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    background: colors.secondary,
    overflow: 'scroll',
    label: colors.primaryText,
    // paddingTop: '10px',
    borderTopStyle: 'solid',
    borderTopColor: colors.primaryText,
    bortderTopWidth: '0px',
    marginTop: '-2px',
  },
}));

type Props = {
  user: any;
  conversations: any[];
  selectConversation: (conversation: any) => void;
};

function AllConversationsContainer(props: Props) {
  const styles = useStyles();

  useEffect(() => {}, []);

  function renderLatestConversations() {
    let output: any[] = [];
    props.conversations.forEach((conversation: any) => {
      output.push(
        <SingleConversation
          key={conversation._id}
          user={props.user}
          conversation={conversation}
          selectConversation={props.selectConversation}
        />
      );
    });

    return output;
  }

  return (
    <div className={styles.wrapper}>
      <RSText bold size={16} className={styles.conversationsHeader}>
        Messages
      </RSText>
      <div className={styles.conversationsContainer}>
        {renderLatestConversations()}
      </div>
    </div>
  );
}

export default AllConversationsContainer;
