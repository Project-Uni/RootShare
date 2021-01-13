import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ManageSpeakersSnackbar from '../../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import PersonalInfoModal from './PersonalInfoModal';

import { slideLeft } from '../../../../../helpers/functions';
import { SnackbarMode } from '../../../../../helpers/types';
import { RSButton } from '../../../../reusable-components';

const useStyles = makeStyles((_: any) => ({
  interestedButton: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 15,
  },
}));

type Props = {
  communityID: string;
  className?: string;
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
    <>
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
      <RSButton
        variant="university"
        className={props.className || styles.interestedButton}
        onClick={() => setShowPersonalInfoModal(true)}
      >
        I'm Interested
      </RSButton>
    </>
  );
}

export default InterestedButton;
