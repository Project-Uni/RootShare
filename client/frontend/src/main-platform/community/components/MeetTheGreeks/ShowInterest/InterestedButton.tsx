import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ManageSpeakersSnackbar from '../../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import PersonalInfoModal from './PersonalInfoModal';
import { RSButtonV2 } from '../../../../reusable-components';
import { RSText } from '../../../../../base-components';

import { slideLeft } from '../../../../../helpers/functions';
import { SnackbarMode } from '../../../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  interestedButton: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 15,
    display: 'flex',
    height: 35,
    width: 120,
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
      <RSButtonV2
        variant="university"
        className={props.className || styles.interestedButton}
        onClick={() => setShowPersonalInfoModal(true)}
        borderRadius={25}
      >
        <RSText size={10} bold={false}>
          I'm Interested
        </RSText>
      </RSButtonV2>
    </>
  );
}

export default InterestedButton;
