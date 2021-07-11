import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import {
  dispatchSnackbar,
  dispatchHoverPreview,
  hoverPreviewTriggerComponentExit,
} from '../../../redux/actions';

import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { FaEllipsisH, FaLock } from 'react-icons/fa';
import { IoCopyOutline, IoTrashBinOutline } from 'react-icons/io5';

import { RSText } from '../../../base-components';
import { RSCard, RSLink, RSAvatar } from '../';

import { CreateEventIcon } from '../../../images';
import {
  formatDatePretty,
  formatTime,
  localDateTimeFromUTC,
} from '../../../helpers/functions';
import { ExternalEventDefault } from '../../../helpers/types';
import { ExternalEventPrivacyEnum } from '../../../helpers/enums';
import Theme from '../../../theme/Theme';
import { deleteCommunityAdminExternalEvent } from '../../../api';

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
  event: ExternalEventDefault;
  showCommunity?: boolean;
  onDelete?: (eventID: string) => void;
};

export const SingleExternalEvent = (props: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  const { event, showCommunity, onDelete } = props;

  const {
    _id: eventID,
    title,
    type,
    description,
    streamLink,
    hostCommunity,
    donationLink,
    privacy,
    banner,
    createdAt,
    updatedAt,
  } = event;
  const startTime = localDateTimeFromUTC(event.startTime);
  const endTime = localDateTimeFromUTC(event.endTime);

  const isHovering = useRef(false);

  useEffect(() => {
    const removeHistoryListen = history.listen((location, action) => {
      if (isHovering.current) isHovering.current = false;
    });
    return removeHistoryListen;
  }, [history]);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();

  const handleDeleteEvent = async () => {
    const data = await deleteCommunityAdminExternalEvent(hostCommunity._id, eventID);

    if (data.successful) onDelete && onDelete(eventID);
    else
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error deleting this event',
        })
      );
  };

  const handleCopy = async () => {
    setMenuAnchorEl(undefined);
    await navigator.clipboard.writeText(`https://rootshare.io/eventInfo/${eventID}`);
    dispatch(dispatchSnackbar({ mode: 'notify', message: 'Copied event link!' }));
  };

  const handleMouseOverFrom = (e: React.MouseEvent<HTMLElement>) => {
    isHovering.current = true;
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (isHovering.current)
        dispatch(
          dispatchHoverPreview({
            _id: hostCommunity._id,
            type: 'community',
            profilePicture: hostCommunity.profilePicture,
            name: hostCommunity.name,
            anchorEl: currentTarget,
          })
        );
    }, 750);
  };

  return (
    <RSCard variant="secondary">
      {showCommunity ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 50,
            paddingRight: 20,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            background: Theme.background,
          }}
        >
          <RSLink
            href={`/community/${hostCommunity._id}`}
            underline="hover"
            style={{ marginRight: 10 }}
          >
            <div
              onMouseEnter={handleMouseOverFrom}
              onMouseLeave={() => {
                isHovering.current = false;
                setTimeout(() => {
                  dispatch(hoverPreviewTriggerComponentExit());
                }, 500);
              }}
            >
              <RSAvatar
                src={hostCommunity.profilePicture}
                style={{ height: 65, width: 65 }}
              />
            </div>
          </RSLink>
          <RSLink href={`/community/${hostCommunity._id}`} underline="hover">
            <div
              onMouseEnter={handleMouseOverFrom}
              onMouseLeave={() => {
                isHovering.current = false;
                setTimeout(() => {
                  dispatch(hoverPreviewTriggerComponentExit());
                }, 500);
              }}
            >
              <RSText bold size={14}>
                {hostCommunity.name}
              </RSText>
            </div>
          </RSLink>
          <IconButton
            style={{ height: '100%', margin: 10, marginLeft: 'auto' }}
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          >
            <FaEllipsisH size={20} />
          </IconButton>
        </div>
      ) : (
        <span />
      )}
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
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 10 }}>
            <RSText weight="bold" size={17} style={{ marginRight: 10 }}>
              {title}
            </RSText>
            {privacy === ExternalEventPrivacyEnum.PRIVATE && (
              <FaLock color={Theme.secondaryText} fontSize={18} />
            )}
          </div>
          <div style={{ display: 'flex', paddingBottom: 10 }}>
            <RSText weight="light" size={13} style={{ paddingRight: 20 }}>
              {formatDatePretty(startTime)}
            </RSText>
            <RSText weight="light" size={13}>
              {formatTime(startTime)}-{formatTime(endTime)}
            </RSText>
          </div>
          <RSText weight="light" style={{ paddingBottom: 25 }} multiline>
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
        {!showCommunity && (
          <IconButton
            style={{ height: '100%', margin: 10, marginLeft: 'auto' }}
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          >
            <FaEllipsisH size={20} />
          </IconButton>
        )}
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
          {onDelete && (
            <MenuItem onClick={handleDeleteEvent} className={styles.menuItem}>
              <IoTrashBinOutline color={Theme.secondaryText} size={15} />
              <RSText color={Theme.secondaryText} style={{ marginLeft: 5 }}>
                Delete
              </RSText>
            </MenuItem>
          )}
        </Menu>
      </div>
    </RSCard>
  );
};
