import React, { useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { IconButton, Badge, ClickAwayListener } from '@material-ui/core';
import Theme from '../../theme/Theme';
import { NotificationIcon } from '../../images';
import { Notifications } from './Notifications';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({ wrapper: {} }));

type Props = {};

export const NotificationButton = (props: Props) => {
  const styles = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [badgeHidden, setBadgeHidden] = useState(true);

  const open = Boolean(anchorEl);

  return (
    <>
      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <IconButton onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}>
          <Badge
            variant="dot"
            style={{ color: Theme.bright }}
            color="error"
            invisible={!badgeHidden}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <img src={NotificationIcon} style={{ height: 25 }} />
          </Badge>
        </IconButton>
      </ClickAwayListener>
      <Notifications
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
};
