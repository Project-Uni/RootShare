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
import Theme from '../../../theme/Theme';

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
    color: Theme.primaryText,
  },
  connectionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    background: Theme.white,
    overflowY: 'scroll',
    overflowX: 'hidden',
    label: Theme.primaryText,
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    borderTopStyle: 'solid',
    borderTopColor: Theme.dark,
    borderTopWidth: '1px',
    paddingTop: 10,
    paddingBottom: 3,
  },
  sectionName: {
    color: Theme.primaryText,
    size: 20,
  },
  pendingContainer: {
    maxHeight: 194,
    overflow: 'scroll',
    borderTopStyle: 'solid',
    borderTopColor: Theme.primary,
    borderTopWidth: '2px',
    marginTop: 5,
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
  const [connections, setConnections] = useState<UserType[]>([]);

  useEffect(() => {
    fetchPendingRequests();
    fetchConnectionSuggestions();
    fetchConnections();
  }, []);

  async function fetchPendingRequests() {
    const { data } = await makeRequest('GET', '/user/getPendingRequests');

    console.log(data);
    if (data['success'] === 1) setPending(data['content']['pendingRequests']);
  }

  async function fetchConnectionSuggestions() {
    const { data } = await makeRequest('GET', '/user/getConnectionSuggestions');

    if (data['success'] === 1) setSuggestions(data['content']['suggestions']);
  }

  async function fetchConnections() {
    const { data } = await makeRequest('GET', '/user/getConnections');

    if (data['success'] === 1) setConnections(data['content']['connections']);
  }

  function removePending(requestID: string) {
    let newPending = pending.slice();
    for (let i = 0; i < pending.length; i++) {
      const currPending = pending[i];
      if (currPending._id === requestID) {
        newPending.splice(i, 1);
        setPending(newPending);
        return;
      }
    }
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

    const numPendingDisplayed = pending.length > 4 ? 4 : pending.length;
    for (let i = 0; i < numPendingDisplayed; i++) {
      const currPending = pending[i];
      output.push(
        <SinglePendingConnection
          key={currPending._id}
          removePending={removePending}
          addConnection={(newConnection: UserType) =>
            setConnections((prevConnections) =>
              prevConnections.concat(newConnection)
            )
          }
          connectionRequest={currPending}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
        />
      );
    }
    return (
      <div>
        <div className={styles.sectionHeader}>
          <RSText className={styles.sectionName}>Pending | {pending.length}</RSText>
        </div>
        <div className={styles.pendingContainer}>{output}</div>
      </div>
    );
  }

  function renderSuggestions() {
    const output: any = [];
    if (suggestions.length === 0) return;

    output.push(
      <div className={styles.sectionHeader}>
        <RSText className={styles.sectionName}>Suggestions</RSText>
      </div>
    );

    const numSuggestionsDisplayed = suggestions.length > 4 ? 4 : suggestions.length;
    for (let i = 0; i < numSuggestionsDisplayed; i++) {
      const currSuggestion = suggestions[i];
      output.push(
        <SingleSuggestion
          removeSuggestion={removeSuggestion}
          key={currSuggestion._id}
          suggestedUser={currSuggestion}
        />
      );
    }
    return output;
  }

  function renderConnections() {
    const output: any = [];
    if (connections.length === 0) return;

    output.push(
      <div className={styles.sectionHeader}>
        <RSText className={styles.sectionName}>Connections</RSText>
      </div>
    );

    for (let i = 0; i < connections.length; i++) {
      const currConnection = connections[i];
      output.push(
        <SingleConnection key={currConnection._id} connectedUser={currConnection} />
      );
    }
    return output;
  }

  // TODO: Make User name in Single Components clickable and link to profile
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
        {renderConnections()}
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
