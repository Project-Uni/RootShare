import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { useSelector, useDispatch } from 'react-redux';
import { updateSidebarComponents } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { WelcomeMessage } from '../../reusable-components';
import { Event } from '../../reusable-components';

import { HEADER_HEIGHT } from '../../../helpers/constants';
import { LeanEventType } from '../../../helpers/types';
import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
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
    color: Theme.bright,
    marginTop: 60,
  },
  box: {
    margin: 8,
    background: Theme.white,
  },
}));

type Props = {
  // user: { [key: string]: any };
};

export default function EventsBody(props: Props) {
  const styles = useStyles();

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootshareReduxState) => ({
    user: state.user,
  }));

  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [events, setEvents] = useState<LeanEventType[]>([]);
  const [connectionIDs, setConnectionIDs] = useState<{ [key: string]: any }>([]);

  useEffect(() => {
    dispatch(
      updateSidebarComponents({
        names: ['discoverCommunities', 'discoverUsers'],
      })
    );
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    const { data } = await makeRequest('GET', '/api/webinar/recents');
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
      const currEvent = events[i];
      let varMutualSignups = connectionIDs.filter((x: string) =>
        currEvent.RSVPs.includes(x)
      );
      const eventDateTime = new Date(currEvent.dateTime);
      const eventDate = formatDatePretty(eventDateTime); //Aug 14, 2020
      const eventTime = formatTime(eventDateTime);
      output.push(
        <Event
          title={currEvent.title}
          eventID={currEvent._id}
          communityName={currEvent.hostCommunity?._id}
          communityID={currEvent.hostCommunity?.name}
          summary={currEvent.brief_description}
          description={currEvent.full_description}
          timestamp={eventDate + ' at ' + eventTime}
          eventBanner={currEvent.eventBanner}
          mutualSignups={varMutualSignups.length}
          rsvpYes={currEvent.RSVPs.includes(user._id)}
          style={styles.eventStyle}
          complete={!!currEvent.muxAssetPlaybackID}
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
