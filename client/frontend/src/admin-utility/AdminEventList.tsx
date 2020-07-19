import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../theme/Colors';

import AdminSingleEvent from './AdminSingleEvent';
import { FileExport } from '@styled-icons/boxicons-solid';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 400,
    border: '1px solid black',
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 20,
    height: '90vh',
  },

  adminEventContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    overflow: 'scroll',
    label: colors.primaryText,
  },
  event: {},
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
      <div className={styles.adminEventContainer}>{renderEvents()}</div>
    </div>
  );
}

export default AdminEventList;
