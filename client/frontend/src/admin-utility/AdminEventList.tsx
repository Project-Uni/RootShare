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
    height: '90vh',
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
