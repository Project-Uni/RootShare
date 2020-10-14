import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import { Event } from '../../reusable-components';

import { HEADER_HEIGHT } from '../../../helpers/constants';
import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.background,
    overflow: 'scroll',
  },
  body: {},
  searchBar: {
    flex: 1,
    marginRight: 10,
  },
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginLeft: 20,
    marginRight: 20,
  },
  eventStyle: {
    margin: 8,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 60,
  },
  box: {
    margin: 8,
    background: colors.primaryText,
  },
}));

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function EventsBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [events, setEvents] = useState<{ [key: string]: any }>([]);
  const [connectionIDs, setConnectionIDs] = useState<{ [key: string]: any }>([]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    const { data } = await makeRequest(
      'GET',
      '/api/webinar/recents',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data.success == 1) {
      setEvents(data.content['events'].reverse());
      setConnectionIDs(data.content['connectionIDs']);
    }
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function renderEvents() {
    const output = [];
    for (let i = 0; i < events.length; i++) {
      let varMutualSignups = connectionIDs.filter((x: string) =>
        events[i].RSVPs.includes(x)
      );
      const eventDateTime = new Date(events[i].dateTime);
      const eventDate = formatDatePretty(eventDateTime); //Aug 14, 2020
      const eventTime = formatTime(eventDateTime);
      output.push(
        <Event
          title={events[i].title}
          eventID={events[i]._id}
          communityName={events[i].hostCommunity?._id}
          communityID={events[i].hostCommunity?.name}
          summary={events[i].brief_description}
          description={events[i].full_description}
          timestamp={eventDate + ' at ' + eventTime}
          mutualSignups={varMutualSignups.length}
          rsvpYes={events[i].RSVPs.includes(props.user._id)}
          style={styles.eventStyle}
        />
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      <Box boxShadow={8} borderRadius={10} className={styles.box}>
        <WelcomeMessage
          title="Events"
          message="You can find future events that are accessible to you on this page."
        />
      </Box>
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : (
        renderEvents()
      )}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsBody);
