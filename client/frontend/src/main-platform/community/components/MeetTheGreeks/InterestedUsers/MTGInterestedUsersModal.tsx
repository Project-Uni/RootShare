import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar, CircularProgress } from '@material-ui/core';
import { FaNetworkWired } from 'react-icons/fa';

import { CSVDownload } from 'react-csv';

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
  speakerLabel: {
    marginLeft: 15,
    maxWidth: 200,
  },
  loadingIndicator: {
    color: theme.primary,
  },
  linkText: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
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
  profilePicture?: string;
  phoneNumber: string;
  graduationYear: number;
  major: string;
  [key: string]: any; //This is for questions
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
  const [selectedUser, setSelectedUser] = useState<InterestedUser>();

  const [performCSVDownload, setPerformCSVDownload] = useState(false);

  useEffect(() => {
    if (selectedUser) setStage('specific');
    else setStage('all');
  }, [selectedUser]);

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
      setInterestedUsers(
        data.content.users.map((user) => {
          let answers = JSON.parse(user.answers);
          let formattedData = Object.assign({}, user, answers);
          delete formattedData.answers;
          return formattedData;
        })
      );
    } else {
      setSnackbarMessage('There was an error getting the list of interested users');
      setSnackbarMode('error');
    }
  }, []);

  const onUserClick = (user: InterestedUser) => {
    setSelectedUser(user);
  };

  const onDownloadCSVClicked = () => {
    setPerformCSVDownload(true);
    setTimeout(() => {
      setPerformCSVDownload(false);
    }, 300);
  };

  const CSVHandler = useCallback(() => {
    const csvData = interestedUsers.map((user) => {
      const formattedData = Object.assign({}, user);
      delete formattedData.profilePicture;
      return formattedData;
    });

    return (
      <>
        {performCSVDownload && (
          <CSVDownload
            data={csvData}
            target="_blank"
            filename={`${communityName}-interested-users.csv`}
          />
        )}
      </>
    );
  }, [interestedUsers, performCSVDownload]);

  const SingleUser = ({ user }: { user: InterestedUser }) => {
    return (
      <div style={{ marginTop: 10 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <a
            href={undefined}
            onClick={() => onUserClick(user)}
            className={styles.linkText}
          >
            <Avatar
              src={user.profilePicture}
              alt={`${user.firstName} ${user.lastName}`}
              style={{ height: 50, width: 50 }}
            />
          </a>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <RSText
                size={12}
                className={[styles.speakerLabel, styles.linkText].join(' ')}
                bold
                onClick={() => onUserClick(user)}
              >
                {user.firstName} {user.lastName}
              </RSText>

              <RSText size={12}>{user.email}</RSText>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <RSText
                size={12}
                className={styles.speakerLabel}
                color={theme.secondaryText}
              >
                {user.major} | {user.graduationYear}
              </RSText>
              <RSText size={12}>{user.phoneNumber}</RSText>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const allInterestedStage = () => (
    <>
      {loading ? (
        <div
          style={{
            height: 200,
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={60} className={styles.loadingIndicator} />
        </div>
      ) : (
        <div style={{ marginLeft: 15, marginRight: 15, marginTop: 25 }}>
          {interestedUsers.map((user) => (
            <SingleUser user={user} />
          ))}
          <BigButton label="Download CSV" onClick={onDownloadCSVClicked} />
        </div>
      )}
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
        return () => setSelectedUser(undefined);
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
          setSelectedUser(undefined);
          onClose();
        }}
        className={styles.modal}
        helperText={`See all of the rushees that have expressed interest in ${communityName}.`}
        helperIcon={<FaNetworkWired size={80} />}
        onBackArrow={getBackArrowFunction()}
        serverErr={serverErr}
      >
        {chooseStage()}
      </RSModal>
      <CSVHandler />
    </>
  );
}

export default MTGInterestedUsersModal;
