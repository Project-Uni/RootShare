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
    height: '85vh',
  },

  adminEventContainer: {
    height: '100%',
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
      output.push(
        <AdminSingleEvent
          key={event._id}
          eventID={event._id}
          eventName={event.title}
          eventDescription={event.brief_description}
          host={`${event.host.firstName} ${event.host.lastName}`}
          dateTime={event.dateTime}
          picture="babyboilers.png"
        />
      );
    });
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.adminEventContainer}>{renderEvents()}</div>
    </div>
  );
}

export default AdminEventList;
