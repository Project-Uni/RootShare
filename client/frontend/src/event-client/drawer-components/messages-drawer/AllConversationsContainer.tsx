import React, { useState, useEffect } from 'react';

import RSText from '../../../base-components/RSText';
import { BsPencilSquare } from 'react-icons/bs';
import { IconButton, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../theme/Colors';

import { connect } from 'react-redux';

import SingleConversation from './SingleConversation';
import CreateNewConversation from './CreateNewConversation';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  conversationsTitle: {
    height: '25px',
    marginBottom: 20,
    marginTop: 20,
    margin: 'auto',
    display: 'inline-block',
    color: colors.primaryText,
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  createNewButton: {},
  createNewIcon: {
    color: colors.primaryText,
  },
  filler: {
    color: colors.secondary,
  },
  conversationsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: colors.secondary,
    overflow: 'scroll',
    label: colors.primaryText,
    borderTopStyle: 'solid',
    borderTopColor: colors.primaryText,
    borderTopWidth: '1px',
    marginTop: '-2px',
  },
  loadingIndicator: {
    marginTop: 40,
  },
}));

type Props = {
  user: any;
  conversations: any[];
  selectConversation: (conversation: any) => void;
};

function AllConversationsContainer(props: Props) {
  const styles = useStyles();

  const [newConversation, setNewConversation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (props.conversations && props.conversations.length > 0) setLoading(false);
  }, [props.conversations]);

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

  return newConversation ? (
    <CreateNewConversation
      user={props.user}
      selectConversation={props.selectConversation}
      setNewConversation={setNewConversation}
    />
  ) : (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.filler}>*SAVE*</div>

        <RSText bold size={16} className={styles.conversationsTitle}>
          Messages
        </RSText>
        <IconButton
          className={styles.createNewButton}
          onClick={() => setNewConversation(true)}
        >
          <BsPencilSquare
            size={24}
            className={styles.createNewIcon}
          ></BsPencilSquare>
        </IconButton>
      </div>

      <div className={styles.conversationsContainer}>
        {loading ? (
          <CircularProgress
            className={styles.loadingIndicator}
            size={200}
            thickness={1.5}
            color="primary"
          />
        ) : (
          renderLatestConversations()
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    conversations: state.conversations,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllConversationsContainer);
