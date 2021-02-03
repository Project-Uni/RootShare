import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../../theme/Colors';

import AdminSingleEvent from './AdminSingleEvent';
import RSText from '../../base-components/RSText';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: 400,
    border: '1px solid black',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    height: '85vh',
  },

  adminEventContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    overflow: 'scroll',
    label: colors.primaryText,
  },
  eventHeader: {
    marginBottom: 10,
  },
}));

type Props = {
  events: any[];
  handleEdit: (event: any) => void;
};

function AdminEventList(props: Props) {
  const styles = useStyles();

  useEffect(() => {}, []);

  function renderEvents() {
    let output: any[] = [];
    props.events.forEach((event: any) => {
      output.push(
        <AdminSingleEvent
          key={event._id}
          event={event}
          handleEdit={props.handleEdit}
        />
      );
    });
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <RSText type="head" size={28} className={styles.eventHeader}>
        Upcoming Events
      </RSText>
      <div className={styles.adminEventContainer}>{renderEvents()}</div>
    </div>
  );
}

export default AdminEventList;
