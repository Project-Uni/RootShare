import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { CircularProgress, Popper } from '@material-ui/core';
import { RSCard } from '../../main-platform/reusable-components';
import { RSText } from '../../base-components';
import { NotificationType, UnifiedNotification } from '../../api';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({ wrapper: {} }));

type Props = {
  open: boolean;
  anchorEl: null | HTMLElement;
  notifications: UnifiedNotification[];
  loading: boolean;
};

export const Notifications = (props: Props) => {
  const { open, anchorEl, notifications, loading } = props;
  const styles = useStyles();

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end">
      <RSCard style={{ width: 300, padding: 10 }} variant="secondary">
        <RSText bold size={13}>
          Notifications
        </RSText>
        {loading ? (
          <CircularProgress color="primary" style={{ height: 40 }} />
        ) : (
          <>
            {notifications.map((n, i) => {
              return <Notification {...n} key={`notification_${i}`} />;
            })}
          </>
        )}
      </RSCard>
    </Popper>
  );
};

const Notification = (props: UnifiedNotification) => {
  const {
    message,
    variant,
    createdAt,
    updatedAt,
    forUser,
    seen,
    relatedItemType,
    actionProviderType,
    actionProvider,
    relatedItem,
  } = props;

  return <div>{message}</div>;
};
