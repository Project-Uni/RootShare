import React, { useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { IconButton, Badge, ClickAwayListener } from '@material-ui/core';
import Theme from '../../theme/Theme';
import { NotificationIcon } from '../../images';
import { Notifications } from './Notifications';
import {
  getNotifications,
  putNotificationsSeen,
  UnifiedNotification,
} from '../../api';
import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../redux/actions';
import { makeRequest } from '../../helpers/functions';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({ wrapper: {} }));

type Props = {};

export const NotificationButton = (props: Props) => {
  const styles = useStyles();

  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [badgeHidden, setBadgeHidden] = useState(true);
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!open && !loading) fetchNotifications();
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await getNotifications();
    if (!data) {
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error retrieving your notifications',
        })
      );
    } else {
      setNotifications(data);
      const hasNewNotifications = data.some((n) => !n.seen);
      setBadgeHidden(!hasNewNotifications);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && notifications.some((n) => !n.seen)) {
      const timeout = setTimeout(() => {
        if (open)
          putNotificationsSeen({
            notifications: notifications.filter((n) => !n.seen),
          });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <>
      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <IconButton onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}>
          <Badge
            variant="dot"
            style={{ color: Theme.bright }}
            color="error"
            invisible={badgeHidden}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <img src={NotificationIcon} style={{ height: 25 }} />
          </Badge>
        </IconButton>
      </ClickAwayListener>
      <Notifications
        open={open}
        anchorEl={anchorEl}
        notifications={notifications}
        loading={false}
      />
    </>
  );
};
