import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { makeRequest } from '../../helpers/functions';
import { EventType } from '../../helpers/types';

import { colors } from '../../theme/Colors';
import SingleEvent from './SingleEvent';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    height: window.innerHeight - 60,
  },
  textFieldContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.primaryText,
    borderTop: '2px solid ' + colors.primaryText,
    color: colors.secondary,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  eventContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    //background: colors.secondary,
    overflow: 'scroll',
    label: colors.primaryText,
  },
}));

type Props = {
  accessToken: string;
  refreshToken: string;
};

function CalendarDrawer(props: Props) {
  const styles = useStyles();

  const [events, setEvents] = useState<EventType[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data } = await makeRequest(
      'GET',
      '/api/webinar/getAllEventsUser',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] === 1) setEvents(data['content']['webinars']);
    else console.log(data);
  }

  function renderEvents() {
    const output: any[] = [];
    events.forEach((event) => {
      console.log(event);
      output.push(<SingleEvent event={event} />);
    });

    return output;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.eventContainer}>{renderEvents()}</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(CalendarDrawer);
