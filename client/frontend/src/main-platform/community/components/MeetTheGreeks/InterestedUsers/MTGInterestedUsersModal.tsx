import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar, CircularProgress, Slide, Grow, Fade } from '@material-ui/core';
import { FaNetworkWired } from 'react-icons/fa';

import { CSVDownload } from 'react-csv';

import theme from '../../../../../theme/Theme';

import {
  formatPhoneNumber,
  makeRequest,
  slideLeft,
} from '../../../../../helpers/functions';

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
      cursor: 'pointer',
    },
  },
  communication: {
    marginTop: 15,
    marginBottom: 5,
  },
  prompt: {
    marginBottom: 5,
  },
}));

type Props = {
  open: boolean;
  communityName: string;
  communityID: string;
  onClose: () => any;
};

type InterestedUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  phoneNumber: string;
  graduationYear: number;
  major: string;
};

type StateUser = InterestedUser & {
  answers: { [key: string]: string };
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

  const [interestedUsers, setInterestedUsers] = useState<StateUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<StateUser>();

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
    const { data } = await makeRequest<{
      users: (InterestedUser & { answers: string })[];
    }>('GET', `/api/mtg/interested/${communityID}`);
    if (data.success === 1) {
      setInterestedUsers(
        data.content.users.map((user) => {
          let answers = JSON.parse(user.answers);
          let formattedData = Object.assign({}, user, { answers });
          return formattedData;
        })
      );
    } else {
      setSnackbarMessage('There was an error getting the list of interested users');
      setSnackbarMode('error');
    }
  }, []);

  const onUserClick = (user: StateUser) => {
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
      const answers = user.answers;
      const formattedData: { [key: string]: any } = Object.assign({}, user, answers);
      delete formattedData.profilePicture;
      delete formattedData.answers;
      return formattedData;
    });

    return (
      <>
        {performCSVDownload && (
          <CSVDownload
            data={csvData}
            target="_self"
            filename={`${communityName}-interested-users.csv`}
          />
        )}
      </>
    );
  }, [interestedUsers, performCSVDownload]);

  const SingleUser = ({ user }: { user: StateUser }) => {
    return (
      <div
        style={{ marginTop: 10 }}
        className={styles.linkText}
        onClick={() => onUserClick(user)}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Avatar
            src={user.profilePicture}
            alt={`${user.firstName} ${user.lastName}`}
            style={{ height: 50, width: 50 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <RSText size={12} className={styles.speakerLabel} bold>
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
              <RSText size={12}>{formatPhoneNumber(user.phoneNumber)}</RSText>
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
        <Slide in={stage === 'all'} direction="up">
          <div style={{ marginLeft: 15, marginRight: 15, marginTop: 25 }}>
            {interestedUsers.map((user) => (
              <SingleUser user={user} />
            ))}
            <BigButton label="Download CSV" onClick={onDownloadCSVClicked} />
          </div>
        </Slide>
      )}
    </>
  );

  const specificUserStage = () => (
    <Slide in={stage === 'specific'} mountOnEnter unmountOnExit direction="left">
      <div
        style={{ marginLeft: 15, marginRight: 15, marginTop: 15, marginBottom: 15 }}
      >
        {selectedUser && (
          <>
            <RSText bold size={13}>
              {selectedUser.firstName} {selectedUser.lastName}
            </RSText>
            <RSText color={theme.secondaryText}>
              {selectedUser.major} | {selectedUser.graduationYear}
            </RSText>
            <RSText bold className={styles.communication}>
              Communication:
            </RSText>
            <RSText>{selectedUser.email}</RSText>
            <RSText>{formatPhoneNumber(selectedUser.phoneNumber)}</RSText>

            <div
              style={{
                borderTop: `2px solid ${theme.disabledButton}`,
                marginTop: 15,
                marginBottom: 15,
              }}
            />

            {Object.keys(selectedUser.answers).map((prompt) => (
              <div style={{ marginBottom: 10 }}>
                <RSText bold className={styles.prompt}>
                  {prompt}
                </RSText>
                <RSText>{selectedUser.answers[prompt]}</RSText>
              </div>
            ))}
          </>
        )}
      </div>
    </Slide>
  );

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
        helperText={
          selectedUser
            ? undefined
            : `See all of the rushees that have expressed interest in ${communityName}.`
        }
        helperIcon={
          selectedUser ? (
            <Fade in={stage === 'specific'} mountOnEnter unmountOnExit>
              <a href={`/profile/${selectedUser._id}`}>
                <Avatar
                  src={selectedUser.profilePicture}
                  style={{
                    height: 125,
                    width: 125,
                    border: `1px solid ${theme.primary}`,
                  }}
                />
              </a>
            </Fade>
          ) : (
            <Grow in={stage === 'all'}>
              <FaNetworkWired size={80} />
            </Grow>
          )
        }
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
