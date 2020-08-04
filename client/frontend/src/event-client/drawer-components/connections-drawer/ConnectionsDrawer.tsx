import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import RSText from '../../../base-components/RSText';
import SingleConnection from './SingleConnection';
import SinglePendingConnection from './SinglePendingConnection';
import SingleSuggestion from './SingleSuggestion';
import MyConnections from '../images/MyConnections.png';

import { colors } from '../../../theme/Colors';
import { UserType, ConnectionRequestType } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    height: window.innerHeight - 60,
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  connectionsTitle: {
    height: '25px',
    marginBottom: 20,
    marginTop: 20,
    margin: 'auto',
    display: 'inline-block',
    color: colors.primaryText,
  },
  connectionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    background: colors.secondary,
    overflowY: 'scroll',
    overflowX: 'hidden',
    label: colors.primaryText,
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    borderTopStyle: 'solid',
    borderTopColor: colors.primaryText,
    borderTopWidth: '1px',
    paddingTop: 10,
  },
  sectionName: {
    color: colors.primaryText,
    size: 20,
  },
}));

type Props = {
  accessToken: string;
  refreshToken: string;
};

function ConnectionsDrawer(props: Props) {
  const styles = useStyles();

  const [pending, setPending] = useState<ConnectionRequestType[]>([]);
  const [suggestions, setSuggestions] = useState<UserType[]>([]);

  useEffect(() => {
    fetchPendingRequests();
    fetchConnectionSuggestions();
  }, []);

  async function fetchConnectionSuggestions() {
    const { data } = await makeRequest(
      'GET',
      '/user/getConnectionSuggestions',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setSuggestions(data['content']['suggestions']);
  }

  async function fetchPendingRequests() {
    const { data } = await makeRequest(
      'GET',
      '/user/getPendingRequests',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setPending(data['content']['pendingRequests']);
  }

  function removeSuggestion(userID: string) {
    let newSuggestions = suggestions.slice();
    for (let i = 0; i < suggestions.length; i++) {
      const currUser = suggestions[i];
      if (currUser._id === userID) {
        newSuggestions.splice(i, 1);
        setSuggestions(newSuggestions);
        return;
      }
    }
  }

  function renderPending() {
    const output: any = [];
    if (pending.length === 0) return;

    output.push(
      <div className={styles.sectionHeader}>
        <RSText className={styles.sectionName}>Pending</RSText>
      </div>
    );

    const numSuggestions = pending.length > 4 ? 4 : pending.length;
    for (let i = 0; i < numSuggestions; i++) {
      const currPending = pending[i];
      output.push(
        <SinglePendingConnection
          removePending={removePending}
          key={currPending._id}
          connectionRequest={currPending}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
        />
      );
    }
    return output;
  }

  function renderSuggestions() {
    const output: any = [];
    if (suggestions.length === 0) return;

    output.push(
      <div className={styles.sectionHeader}>
        <RSText className={styles.sectionName}>Suggestions</RSText>
      </div>
    );

    const numSuggestions = suggestions.length > 4 ? 4 : suggestions.length;
    for (let i = 0; i < numSuggestions; i++) {
      const currSuggestion = suggestions[i];
      output.push(
        <SingleSuggestion
          removeSuggestion={removeSuggestion}
          key={currSuggestion._id}
          suggestedUser={currSuggestion}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
        />
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <RSText bold size={16} className={styles.connectionsTitle}>
          Connections
        </RSText>
      </div>
      <div className={styles.connectionContainer}>
        {renderPending()}
        {renderSuggestions()}
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionsDrawer);
