import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Slide, Menu, MenuItem } from '@material-ui/core';
import { FaEllipsisH, FaRegStar, FaStar } from 'react-icons/fa';
import { TransitionProps } from '@material-ui/core/transitions';

import { MessageType } from '../../helpers/types';
import { makeRequest, getConversationTime } from '../../helpers/functions';

import RSText from '../../base-components/RSText';
import ManageSpeakersSnackbar from '../event-video/event-host/ManageSpeakersSnackbar';
import Theme from '../../theme/Theme';
import { putUpdateUserConnection } from '../../api';
const ITEM_HEIGHT = 48;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    paddingBottom: 4,
    display: 'flex',
  },
  top: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  left: {
    flex: 1,
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 7,
    marginBottom: 5,
  },
  senderName: {
    margin: 10,
    display: 'inline-block',
    wordWrap: 'break-word',
    maxWidth: 240,
  },
  message: {
    textAlign: 'left',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 7,
    marginBottom: 10,
    wordWrap: 'break-word',
    maxWidth: 290,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  likeCount: {},
  star: {
    '&:hover': {
      color: Theme.secondaryText,
      cursor: 'pointer',
    },
    marginTop: -10,
    marginBottom: 3,
    color: Theme.bright,
  },
  starGray: {
    '&:hover': {
      color: Theme.bright,
      cursor: 'pointer',
    },
    marginTop: -10,
    marginBottom: 3,
    color: 'grey',
  },
  time: {
    marginTop: 12,
    display: 'inline-block',
    color: 'grey',
  },
  ellipsis: {
    '&:hover': {
      cursor: 'pointer',
    },
    color: 'grey',
    marginBottom: 18,
    paddingRight: 1,
  },
}));

type Props = {
  message: MessageType;
  accessToken: string;
  refreshToken: string;
  isHost?: boolean;
  handleRemoveUser?: (userID: string) => Promise<-1 | 0 | 1>;
};

function EventMessage(props: Props) {
  const styles = useStyles();
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);
  const [loadingLike, setLoadingLike] = useState(false);

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    setLiked(props.message.liked);
  }, [props.message.liked]);

  useEffect(() => {
    setNumLikes(props.message.numLikes);
  }, [props.message.numLikes]);

  async function handleLikeClicked() {
    setLiked((prevVal) => {
      setNumLikes((prevNumLikes) => {
        if (prevVal) return prevNumLikes > 0 ? prevNumLikes - 1 : 0;
        else return prevNumLikes + 1;
      });
      return !prevVal;
    });
    setLoadingLike(true);
    const { data } = await makeRequest('POST', '/api/messaging/updateLike', {
      messageID: props.message._id,
      liked: !liked,
    });
    setLoadingLike(false);

    if (data['success'] === 1) setLiked(data['content']['newLiked']);
  }

  function handleOptionsClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function slideLeft(props: TransitionProps) {
    return <Slide {...props} direction="left" />;
  }

  async function handleConnect() {
    const data = await putUpdateUserConnection(
      'connect',
      props.message.sender as string
    );
    setAnchorEl(null);

    setSnackbarMessage(data['message']);

    if (data['success'] === 1) setSnackbarMode('success');
    else if (data['success'] === 0) setSnackbarMode('notify');
    else {
      setSnackbarMode('error');
      setSnackbarMessage('There was an error requesting the connection');
    }

    setTransition(() => slideLeft);
  }

  async function handleRemoveUser() {
    setAnchorEl(null);
    if (
      !window.confirm('Are you sure you want to remove this user from the stream?')
    )
      return;

    if (props.handleRemoveUser) {
      const success = await props.handleRemoveUser(props.message.sender as string);

      if (success === 1) {
        setSnackbarMode('notify');
        setSnackbarMessage('Successfully removed user from stream');
        setTransition(() => slideLeft);
      } else if (success == 0) {
        setSnackbarMode('notify');
        setSnackbarMessage('User has already left the event');
        setTransition(() => slideLeft);
      } else {
        setSnackbarMode('error');
        setSnackbarMessage(
          'There was an error trying to remove this user. Please try again'
        );
        setTransition(() => slideLeft);
      }
    }
  }

  function renderOptions() {
    return (
      <div>
        <MenuItem onClick={handleConnect}>Connect</MenuItem>
        {props.isHost && (
          <MenuItem onClick={handleRemoveUser}>
            <RSText color={Theme.error} size={12}>
              Remove
            </RSText>
          </MenuItem>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className={styles.wrapper}>
        <ManageSpeakersSnackbar
          message={snackbarMessage}
          transition={transition}
          mode={snackbarMode}
          handleClose={() => setSnackbarMode(null)}
        />
        <div className={styles.left}>
          <div className={styles.top}>
            <RSText bold className={styles.senderName}>
              {props.message.senderName}
            </RSText>
            <RSText size={10} className={styles.time}>
              {getConversationTime(new Date(props.message.createdAt))}
            </RSText>
          </div>
          <div className={styles.bottom}>
            <RSText className={styles.message}>{props.message.content}</RSText>
          </div>
        </div>
        <div className={styles.right}>
          <FaEllipsisH
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleOptionsClick}
            className={styles.ellipsis}
            size={17}
          />

          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={menuOpen}
            onClose={handleClose}
            PaperProps={{
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: 200,
              },
            }}
          >
            {renderOptions()}
          </Menu>
          {liked ? (
            <FaStar
              // disabled={loadingLike}
              className={styles.star}
              onClick={handleLikeClicked}
              size={20}
            />
          ) : (
            <FaRegStar
              // disabled={loadingLike}
              className={styles.starGray}
              onClick={handleLikeClicked}
              size={20}
            />
          )}
          <RSText size={10} className={styles.likeCount}>
            {numLikes}
          </RSText>
        </div>
      </div>
    </div>
  );
}

export default EventMessage;
