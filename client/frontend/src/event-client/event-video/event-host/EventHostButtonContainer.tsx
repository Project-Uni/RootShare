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
import { makeRequest } from '../../../helpers/makeRequest';

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
  handleManageSpeakers: () => void;
  loading: boolean;
  mode: 'admin' | 'speaker';
};

function EventHostButtonContainer(props: Props) {
  const styles = useStyles();

  const [showManageDialog, setShowManageDialog] = useState(false);

  function handleManageSpeakersClick() {
    setShowManageDialog(true);
  }

  function handleOnSpeakerAdd(user: { [key: string]: any }) {
    //TODO - Add notification for host that speaker was successfully invited
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
          <Video size={28} color="white" />
        ) : (
          <VideoOff size={28} color="white" />
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
          <Microphone color="white" size={26} />
        ) : (
          <MicrophoneOff color="white" size={26} />
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
          disabled={props.loading}
          onClick={handleManageSpeakersClick}
        >
          Manage Speakers
        </Button>
      )}
    </div>
  );
}

export default EventHostButtonContainer;
