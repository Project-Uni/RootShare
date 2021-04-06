import React, { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core";
import Theme from '../../../theme/Theme';
import { Event, RSLink } from '../../reusable-components';
import { RSCard } from './RSCard';
import { formatDateMonth, formatDatePretty, formatTime, makeRequest } from '../../../helpers/functions';
import { LeanEventType } from '../../../helpers/types';
import { RSText } from '../../../base-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  banner: {
    backgroundColor: Theme.primaryHover,
    backgroundPosition: 'left top',
    backgroundFit: 'cover',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    borderRadius: 40,
    height: '100%',
    width: '100%',
  },
  bannerFilter: {
    borderRadius: 40,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '100%',
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
        <RSCard className={styles.event}>
          <RSLink
            href={`/event/${currEvent._id}`}
          >
            <div
              style={{
                backgroundImage: `url(${currEvent.eventBanner})`,
              }}
              className={styles.banner}
            >
              <div className={styles.bannerFilter}>
                <div className={styles.text}>
                  <RSText color={Theme.white} size={18} bold={true}>{eventDate}</RSText>
                  <RSText color={Theme.white} size={14} bold={true}>{currEvent.title}</RSText>
                </div>
              </div>
            </div>
          </RSLink>
        </RSCard>
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

function handleResize(arg0: string, handleResize: any) {
  throw new Error('Function not implemented.');
}
