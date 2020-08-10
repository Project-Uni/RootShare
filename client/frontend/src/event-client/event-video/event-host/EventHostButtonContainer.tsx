import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';
import {
  Video,
  VideoOff,
  Microphone,
  MicrophoneOff,
} from '@styled-icons/boxicons-solid';

import { colors } from '../../../theme/Colors';
import ManageSpeakersDialog from './ManageSpeakersDialog';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: 1,
    paddingTop: 5,
    paddingBottom: 5,
  },
  buttonDefault: {
    marginLeft: 8,
    marginBottom: 'auto',
    backgroundColor: colors.secondary,
    color: 'white',
    '&:hover': {
      backgroundColor: colors.ternary,
    },
  },
  cameraIcon: {},
  disabledButton: {
    background: 'lightgray',
  },
}));

type Props = {
  webinarID: string;
  isStreaming: boolean;
  showWebcam: boolean;
  muted: boolean;
  sharingScreen: boolean;
  handleStreamStatusChange: () => void;
  toggleWebcam: () => void;
  toggleMute: () => void;
  toggleScreenshare: () => void;
  loading: boolean;
  mode: 'admin' | 'speaker';
  removeGuestSpeaker: (connection: OT.Connection) => void;
};

function EventHostButtonContainer(props: Props) {
  const styles = useStyles();

  const [showManageDialog, setShowManageDialog] = useState(false);
  const [manageSpeakersDisabled, setManageSpeakersDisabled] = useState(false);

  function handleManageSpeakersClick() {
    setShowManageDialog(true);
  }

  function handleOnSpeakerAdd(user: { [key: string]: any }) {
    setManageSpeakersDisabled(true);
    //Waiting 3 seconds b/c it takes ~2 seconds to get the connection from the new user if they accept immediately
    //TODO - Change this to use a socket for when a user is loading. Won't be able to finish this feature in time for august 14th
    setTimeout(() => {
      setManageSpeakersDisabled(false);
    }, 3000);
    setShowManageDialog(false);
  }

  function handleManageSpeakersCancel() {
    setShowManageDialog(false);
  }

  return (
    <div className={styles.wrapper}>
      <ManageSpeakersDialog
        open={showManageDialog}
        onCancel={handleManageSpeakersCancel}
        onAdd={handleOnSpeakerAdd}
        webinarID={props.webinarID}
        removeGuestSpeaker={props.removeGuestSpeaker}
      />

      {props.mode === 'admin' && (
        <Button
          variant="contained"
          onClick={props.handleStreamStatusChange}
          className={[styles.buttonDefault].join(' ')}
          disabled={props.loading}
        >
          {!props.isStreaming ? 'Begin Live Stream' : 'End Live Stream'}
        </Button>
      )}

      <Button
        className={[
          styles.buttonDefault,
          styles.cameraIcon,
          props.loading ? styles.disabledButton : null,
        ].join(' ')}
        onClick={props.toggleWebcam}
        disabled={props.loading}
      >
        {props.showWebcam ? (
          <Video size={24} color="white" />
        ) : (
          <VideoOff size={24} color="white" />
        )}
      </Button>
      <Button
        className={[
          styles.buttonDefault,
          styles.cameraIcon,
          props.loading ? styles.disabledButton : null,
        ].join(' ')}
        onClick={props.toggleMute}
        disabled={props.loading}
      >
        {!props.muted ? (
          <Microphone color="white" size={24} />
        ) : (
          <MicrophoneOff color="white" size={24} />
        )}
      </Button>
      <Button
        variant="contained"
        className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
        onClick={props.toggleScreenshare}
        disabled={props.loading}
      >
        {!props.sharingScreen ? 'Share Screen' : 'Stop Sharing Screen'}
      </Button>
      {props.mode === 'admin' && (
        <Button
          variant="contained"
          className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
          disabled={props.loading || manageSpeakersDisabled}
          onClick={handleManageSpeakersClick}
        >
          Manage Speakers
        </Button>
      )}
    </div>
  );
}

export default EventHostButtonContainer;
