import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../theme/Colors';

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

  function renderEvents() {
    return (
      <AdminSingleEvent
        eventID="1001"
        eventName="SMIT IS EVEN NICER. #69"
        eventDescription="14"
        organization="RootShare"
        day="25"
        month="DEC"
        year="2020"
        time="6"
        ampm="PM"
        timezone="EST"
        picture="babyboilers.png"
      />
    );
  }

  return <div className={styles.wrapper}>{renderEvents()}</div>;
}

export default AdminEventList;
