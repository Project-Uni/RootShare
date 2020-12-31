import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';

import ManageSpeakersSnackbar from '../../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import PersonalInfoModal from './PersonalInfoModal';

import { colors } from '../../../../../theme/Colors';
import { slideLeft } from '../../../../../helpers/functions';
import { SnackbarMode } from '../../../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  interestedButton: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 15,
    background: colors.accentColors[0],
    color: colors.primaryText,
    '&:hover': {
      background: colors.secondaryText,
    },
  },
}));

type Props = {
  communityID: string;
};

function InterestedButton(props: Props) {
  const styles = useStyles();

  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);
  const [transition, setTransition] = useState<any>();

  function handleSnackbar(message: string, mode: SnackbarMode) {
    setSnackbarMessage(message);
    setSnackbarMode(mode);
    setTransition(() => slideLeft);
  }

  return (
    <div className={styles.wrapper}>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <PersonalInfoModal
        open={showPersonalInfoModal}
        communityID={props.communityID}
        handleSnackbar={handleSnackbar}
        onClose={() => setShowPersonalInfoModal(false)}
      />
      <Button
        className={styles.interestedButton}
        size="large"
        onClick={() => setShowPersonalInfoModal(true)}
      >
        I'm Interested!
      </Button>
    </div>
  );
}

export default InterestedButton;
