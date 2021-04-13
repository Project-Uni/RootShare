import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import { formatDateMonth } from '../../../helpers/functions';
import { EventWidget } from './EventWidget';
import { GetRecentEventResponse, getRecentEvents } from '../../../api';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 7,
    marginBottom: 7,
  },
  event: {
    height: 175,
    width: '33%',
    marginLeft: 15,
    marginRight: 15,
  },
}));

type Props = {};

export const PromotedEvents = (props: Props) => {
  const styles = useStyles();

  const [events, setEvents] = useState<GetRecentEventResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    // const { data } = await makeRequest('GET', '/api/webinar/recent');
    const data = await getRecentEvents(3);
    if (data.success == 1) {
      setEvents(data.content.events.reverse());
    }
  }

  function renderEvents() {
    const output = [];
    for (let i = 0; i < events.length; i++) {
      const currEvent = events[i];
      const eventDateTime = new Date(currEvent.dateTime);
      const eventDate = formatDateMonth(eventDateTime); //14 Aug
      output.push(
        <EventWidget
          className={styles.event}
          _id={currEvent._id}
          title={currEvent.title}
          date={eventDate}
          image={currEvent.eventImage}
        />
      );
    }
    return output;
  }

  return <div className={styles.wrapper}>{renderEvents()}</div>;
};
