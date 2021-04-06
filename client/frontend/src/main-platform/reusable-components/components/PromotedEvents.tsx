import React, { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core";
import Theme from '../../../theme/Theme';
import { RSCard } from './RSCard';
import { formatDateMonth, formatDatePretty, formatTime, makeRequest } from '../../../helpers/functions';
import { LeanEventType } from '../../../helpers/types';
import { RSText } from '../../../base-components';
import { EventWidget } from './EventWidget';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  event: {
    height: 150,
    width: '33%',
  }
  
}));

type Props = {};

export const PromotedEvents = (props: Props) => {
  const styles = useStyles();

  const [events, setEvents] = useState<LeanEventType[]>([]);
  const [connectionIDs, setConnectionIDs] = useState<{ [key: string]: any }>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);


  async function fetchData() {
    const { data } = await makeRequest('GET', '/api/webinar/promoted');
    if (data.success == 1) {
      setEvents(data.content['events'].reverse());
      setConnectionIDs(data.content['connectionIDs']);
    }
  }

  function renderEvents() {
    const output = [];
    for (let i = 0; i < events.length; i++) {
      const currEvent = events[i];
      const eventDateTime = new Date(currEvent.dateTime);
      const eventDate = formatDateMonth(eventDateTime); //Aug 14, 2020
      const eventTime = formatTime(eventDateTime);
      output.push(
        <EventWidget
          className={styles.event}
          _id={currEvent._id}
          title={currEvent.title}
          date={eventDate}
          banner={currEvent.eventBanner}
        />
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper}>
      {renderEvents()}
    </div>
  );
};
