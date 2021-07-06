import React, { useState, useEffect } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';

import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../../redux/actions';

import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { FaEllipsisH } from 'react-icons/fa';
import { IoCopyOutline } from 'react-icons/io5';

import { RSText } from '../../../base-components';
import { RSCard } from '../';

import { CreateEventIcon } from '../../../images';
import {
  formatDatePretty,
  formatTime,
  localDateTimeFromUTC,
} from '../../../helpers/functions';
import { ExternalEvent } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {},
  menuItem: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
}));

type Props = {
  event: ExternalEvent;
};

export const SingleExternalEvent = (props: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();

  const {
    _id: eventID,
    title,
    type,
    description,
    streamLink,
    donationLink,
    privacy,
    banner,
    createdAt,
    updatedAt,
  } = props.event;
  const startTime = localDateTimeFromUTC(props.event.startTime);
  const endTime = localDateTimeFromUTC(props.event.endTime);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();

  const handleCopy = async () => {
    setMenuAnchorEl(undefined);
    await navigator.clipboard.writeText(`https://rootshare.io/eventInfo/${eventID}`);
    dispatch(dispatchSnackbar({ mode: 'notify', message: 'Copied event link!' }));
  };

  return (
    <RSCard variant="secondary">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <img
          src={banner || CreateEventIcon}
          style={{
            margin: 25,
            width: 300,
            height: 200,
            borderRadius: 20,
            objectFit: 'contain',
          }}
        />
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: 20,
            paddingRight: 60,
            textAlign: 'left',
          }}
        >
          <RSText weight="bold" size={17} style={{ paddingBottom: 10 }}>
            {title}
          </RSText>
          <div style={{ display: 'flex', paddingBottom: 10 }}>
            <RSText weight="light" size={13} style={{ paddingRight: 20 }}>
              {formatDatePretty(startTime)}
            </RSText>
            <RSText weight="light" size={13}>
              {formatTime(startTime)}
            </RSText>
          </div>
          <RSText weight="light" style={{ paddingBottom: 25 }}>
            {description}
          </RSText>
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-end',
              paddingBottom: 10,
            }}
          >
            {/* <RSButtonV2 style={{ height: 30, marginRight: 20 }}>
              <RSText size={10} color={Theme.altText}>
                Download Attendees
              </RSText>
            </RSButtonV2> */}
            {/* <RSButtonV2 style={{ height: 30 }}>
              <RSText size={10} color={Theme.altText}>
                Edit Event
              </RSText>
            </RSButtonV2> */}
          </div>
        </div>
        <IconButton
          style={{ height: '100%', margin: 10 }}
          onClick={(e) => setMenuAnchorEl(e.currentTarget)}
        >
          <FaEllipsisH size={20} />
        </IconButton>
        <Menu
          open={Boolean(menuAnchorEl)}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(undefined)}
        >
          <MenuItem className={styles.menuItem} onClick={handleCopy}>
            <IoCopyOutline color={Theme.secondaryText} size={15} />
            <RSText color={Theme.secondaryText} style={{ marginLeft: 5 }}>
              Copy Link
            </RSText>
          </MenuItem>
        </Menu>
      </div>
    </RSCard>
  );
};
