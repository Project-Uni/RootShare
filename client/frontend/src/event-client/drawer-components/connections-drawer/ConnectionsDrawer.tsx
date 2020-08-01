import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import RSText from '../../../base-components/RSText';
import SingleConnection from './SingleConnection';
import SinglePendingConnection from './SinglePendingConnection';
import SingleSuggestion from './SingleSuggestion';
import MyConnections from '../images/MyConnections.png';

import { colors } from '../../../theme/Colors';
import { UserType } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';
import { Connections } from '../../../main-platform';

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
    overflow: 'scroll',
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

  const [suggestions, setSuggestions] = useState<UserType[]>([]);

  useEffect(() => {
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
        <SingleSuggestion key={currSuggestion._id} suggestedUser={currSuggestion} />
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
      <div className={styles.connectionContainer}>{renderSuggestions()}</div>
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
