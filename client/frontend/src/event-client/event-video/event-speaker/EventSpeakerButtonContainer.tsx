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
  disabledButton: {
    background: 'lightgray',
  },
}));

type Props = {
  showWebcam: boolean;
  muted: boolean;
  sharingScreen: boolean;
  toggleWebcam: () => void;
  toggleMute: () => void;
  toggleScreenshare: () => void;
  loading: boolean;
};

function EventSpeakerButtonContainer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <Button
        className={[
          styles.buttonDefault,
          styles.cameraIcon,
          props.loading || props.sharingScreen ? styles.disabledButton : null,
        ].join(' ')}
        onClick={props.toggleWebcam}
        disabled={props.loading || props.sharingScreen}
      >
        {!props.showWebcam ? (
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
        {!props.sharingScreen ? 'Share Screen' : 'Sharing Screen'}
      </Button>
    </div>
  );
}

export default EventSpeakerButtonContainer;
