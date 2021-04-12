import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useDispatch } from 'react-redux';
import { updateSidebarComponents } from '../../redux/actions';

import { CircularProgress } from '@material-ui/core';

import MTGEvent from './MTGEvent';
import ManageSpeakersSnackbar from '../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import MeetTheGreeksInfoCard from './MeetTheGreeksInfoCard';

import { makeRequest, slideLeft } from '../../helpers/functions';
import Theme from '../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: Theme.background,
    flex: 1,
    overflow: 'scroll',
  },
  loadingIndicator: {
    color: Theme.primary,
    marginTop: 50,
  },
  mtgEvent: {
    marginTop: 15,
    marginLeft: 8,
    marginRight: 8,
  },
  header: {
    marginLeft: 8,
    marginRight: 8,
    marginTop: 8,
  },
}));

export type Event = {
  _id: string;
  description: string;
  introVideoURL: string;
  dateTime: Date;
  community: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  eventBanner: string;
};

type ServiceResponse = {
  events: Event[];
};

type Props = {};

function MeetTheGreeks(props: Props) {
  const styles = useStyles();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [transition, setTransition] = useState<any>(() => slideLeft);
  const [snackbarMode, setSnackbarMode] = useState<
    'notify' | 'success' | 'error' | null
  >(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    dispatch(
      updateSidebarComponents({
        names: ['discoverCommunities', 'discoverUsers'],
      })
    );
    fetchEvents().then(() => setLoading(false));
  }, []);

  const fetchEvents = async () => {
    const { data } = await makeRequest<ServiceResponse>('GET', '/api/mtg/events');
    if (data.success === 1) {
      setEvents(data.content.events);
    } else {
    }
  };

  const dispatchSnackbar = (mode: typeof snackbarMode, message: string) => {
    setSnackbarMessage(message);
    setSnackbarMode(mode);
  };

  return (
    <div className={styles.wrapper}>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <MeetTheGreeksInfoCard className={styles.header} />
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : (
        <>
          {events.map((event) => (
            <MTGEvent
              key={`mtgEvent_${event._id}`}
              event={event}
              className={styles.mtgEvent}
              dispatchSnackbar={dispatchSnackbar}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default MeetTheGreeks;
