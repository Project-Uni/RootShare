import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaNetworkWired } from 'react-icons/fa';

import theme from '../../../../../theme/Theme';

import { makeRequest, slideLeft } from '../../../../../helpers/functions';

import { BigButton, RSModal } from '../../../../reusable-components';
import { RSText } from '../../../../../base-components';

import ManageSpeakersSnackbar from '../../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  richEditor: {
    height: 300,
    marginTop: 10,
  },
  emailHeader: {
    marginLeft: 15,
    marginRight: 15,
  },
  confirmedMessage: {
    marginTop: 15,
  },
}));

type Props = {
  open: boolean;
  communityName: string;
  communityID: string;
  onClose: () => any;
};

type InterestedUser = {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  phoneNumber: string;
  graduationYear: number;
  major: string;
  answers: string;
};

type Stage = 'all' | 'specific';

function MTGInterestedUsersModal(props: Props) {
  const styles = useStyles();

  const { open, communityName, communityID, onClose } = props;

  const [serverErr, setServerErr] = useState<string>();
  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState<Stage>('all');

  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);
  const [transition, setTransition] = useState<any>(() => slideLeft);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getInterestedUsers().then(() => setLoading(false));
    }
  }, [open]);

  const getInterestedUsers = useCallback(async () => {
    const { data } = await makeRequest<{ users: InterestedUser[] }>(
      'GET',
      `/api/mtg/interested/${communityID}`
    );
    if (data.success === 1) {
      setInterestedUsers(data.content.users);
    } else {
      setSnackbarMessage('There was an error getting the list of interested users');
      setSnackbarMode('error');
    }
  }, []);

  const allInterestedStage = () => (
    <>
      <BigButton label="Download CSV" onClick={() => {}} />
    </>
  );

  const specificUserStage = () => <></>;

  const chooseStage = () => {
    switch (stage) {
      case 'specific':
        return specificUserStage();
      case 'all':
      default:
        return allInterestedStage();
    }
  };

  const getBackArrowFunction = useCallback(() => {
    switch (stage) {
      case 'specific':
        return () => setStage('all');
      case 'all':
      default:
        return undefined;
    }
  }, [stage]);

  return (
    <>
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <RSModal
        open={open}
        title={`Interested Users - ${communityName}`}
        onClose={() => {
          setStage('all');
          onClose();
        }}
        className={styles.modal}
        helperText={
          'See all of the rushees that have given interest in your fraternity. Great job with rush!'
        }
        helperIcon={<FaNetworkWired size={80} />}
        onBackArrow={getBackArrowFunction()}
        serverErr={serverErr}
      >
        {chooseStage()}
      </RSModal>
    </>
  );
}

export default MTGInterestedUsersModal;
