import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

import { colors } from '../theme/Colors';
import log from '../helpers/logger';

import AdminSingleEvent from './AdminSingleEvent';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 400,
    border: '1px solid black',
    borderRadius: 10,
    margin: 'auto',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },

  adminEventContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    //background: colors.secondary,
    overflow: 'scroll',
    label: colors.primaryText,
  },
  event: {},
}));

type Props = {};

function AdminEventList(props: Props) {
  const styles = useStyles();

  const [events, setEvents] = useState<any>([]);

  useEffect(() => {
    updateEvents();
  }, []);

  async function updateEvents() {
    const { data } = await axios.get('/api/webinar/getAllEvents');
    if (data['success'] !== 1) return log('error', data['message']);
    setEvents(data['content']['webinars']);
  }

  function renderEvents() {
    let output: any[] = [];
    events.forEach((event: any) => {
      // console.log(event);
      const eventDate = new Date(event.date);
      output.push(
        <AdminSingleEvent
          eventID={event._id}
          eventName={event.title}
          eventDescription={event.brief_description}
          organization={`${event.host.firstName} ${event.host.lastName}`}
          day={eventDate.getDay().toString()}
          month={eventDate.getMonth().toString()}
          year={eventDate.getFullYear().toString()}
          time="6"
          ampm="PM"
          timezone="EST"
          picture="babyboilers.png"
        />
      );
    });
    return output;
  }

  return <div className={styles.wrapper}>{renderEvents()}</div>;
}

export default AdminEventList;
