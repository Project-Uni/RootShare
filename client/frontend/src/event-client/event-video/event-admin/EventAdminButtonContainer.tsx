import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';
import {
  Video,
  VideoOff,
  Microphone,
  MicrophoneOff,
} from '@styled-icons/boxicons-solid';

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
    //TODO - Change once color scheme is updated
    backgroundColor: '#3D66DE',
    color: 'white',
    '&:hover': {
      //TODO - Change once color scheme is updated
      backgroundColor: '#4272E6',
    },
  },
  cameraIcon: {},
}));

type Props = {
  isStreaming: boolean;
  showWebcam: boolean;
  muted: boolean;
  sharingScreen: boolean;
  handleStreamStatusChange: () => void;
  toggleWebcam: () => void;
  toggleMute: () => void;
  toggleScreenshare: () => void;
};

function EventAdminButtonContainer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <Button
        variant="contained"
        onClick={props.handleStreamStatusChange}
        className={[styles.buttonDefault].join(' ')}
      >
        {!props.isStreaming ? 'Begin Live Stream' : 'End Live Stream'}
      </Button>
      <Button
        className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
        onClick={props.toggleWebcam}
      >
        {props.showWebcam ? (
          <Video size={28} color="white" />
        ) : (
          <VideoOff size={28} color="white" />
        )}
      </Button>
      <Button
        className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
        onClick={props.toggleMute}
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
      >
        Share Screen
      </Button>
      <Button
        variant="contained"
        className={[styles.buttonDefault, styles.cameraIcon].join(' ')}
      >
        Manage Speakers
      </Button>
    </div>
  );
}

export default EventAdminButtonContainer;
