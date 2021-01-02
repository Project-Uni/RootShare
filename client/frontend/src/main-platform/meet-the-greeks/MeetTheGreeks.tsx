import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { makeRequest } from '../../helpers/functions';
import Theme from '../../theme/Theme';
import { CircularProgress } from '@material-ui/core';
import MTGEvent from './MTGEvent';

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
    marginTop: 10,
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
  };
  eventBanner: string;
};

type ServiceResponse = {
  events: Event[];
};

type Props = {};

function MeetTheGreeks(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents().then(() => setLoading(false));
  }, []);

  const fetchEvents = async () => {
    const { data } = await makeRequest<ServiceResponse>('GET', '/api/mtg/events');
    if (data.success === 1) {
      setEvents(data.content.events);
    } else {
    }
  };
  return (
    <div className={styles.wrapper}>
      <div>Header component</div>
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : (
        <>
          {events.map((event) => (
            <MTGEvent event={event} className={styles.mtgEvent} />
          ))}
        </>
      )}
    </div>
  );
}

export default MeetTheGreeks;
