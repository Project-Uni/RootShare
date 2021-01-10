import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { CircularProgress, IconButton, Button } from '@material-ui/core';
import { BsPeopleFill } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';

import { RSModal, RSButton } from '../../../main-platform/reusable-components';
import RSText from '../../../base-components/RSText';
import { UserSearch } from '../../../main-platform/reusable-components';

import { makeRequest } from '../../../helpers/functions';
import { useForm } from '../../../helpers/hooks';
import { SnackbarMode, SpeakRequestType } from '../../../helpers/types';
import theme from '../../../theme/Theme';
import { colors, addAlpha } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  modalWrapper: {
    padding: 10,
    paddingTop: 20,
  },
  loadingIndicator: {
    color: theme.primary,
  },
  bright: {
    color: colors.bright,
    marginBottom: 6,
  },
  textField: {
    width: 460,
  },
  bottomBorder: {
    marginBottom: 12,
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: addAlpha(colors.secondaryText, 0.3),
  },

  guestSpeakerContainer: {
    marginBottom: 12,
  },
  guestSpeaker: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    '&:hover': {
      background: colors.background,
    },
  },
  guestSpeakerText: {
    color: 'black',
  },
  guestSpeakerEmail: {
    color: colors.secondaryText,
  },

  autoCompleteContainer: {
    paddingBottom: 10,
    marginBottom: 5,
  },
  inviteButtonsContainer: {
    display: 'flex',
    marginRight: 17,
  },
  selectedName: {
    marginBottom: 3,
  },
  selectedUserAdd: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  speakRequestsContainer: {
    marginTop: 5,
    marginBottom: 10,
    paddingBottom: 5,
  },
  speakRequestWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
    paddingTop: 7,
    paddingBottom: 7,
    '&:hover': {
      background: colors.background,
    },
  },
  removeButton: {
    color: colors.primaryText,
    background: 'gray',
    height: 27,
  },
  acceptButton: {
    color: colors.primaryText,
    background: colors.bright,
    height: 27,
    marginLeft: 7,
  },

  activeViewerCount: {
    marginLeft: 10,
  },
}));

export type IFormData = {
  searchedUser: UserOption | undefined;
};

type UserInfo = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  connection?: OT.Connection;
};

type GuestSpeaker = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  speakingToken: string;
  connection?: OT.Connection;
};

type UserOption = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  connection?: OT.Connection;

  label: string;
  value: string;
};

type ViewersServiceResponse = {
  users: UserInfo[];
  currentSpeakers: GuestSpeaker[];
};

const defaultFormData: IFormData = {
  searchedUser: undefined,
};

/* Keeping this here for now, this is how to generate a type based on existing variable - I've been looking for this solution for a long time
 *
 * type IFormData = {
 *  [key in keyof typeof defaultFormData]: typeof defaultFormData[key];
 * };
 *
 */

type Props = {
  open: boolean;
  webinarID: string;
  sessionID: string;

  speakRequests: SpeakRequestType[];
  removeSpeakRequest: (viewerID: string) => void;

  onClose: () => any;
  handleSnackbar: (message: string, mode: SnackbarMode) => void;
  onAdd: (user: { [key: string]: any }) => void;
  removeGuestSpeaker: (connection: OT.Connection) => void;
};

function MeetTheGreeksModal(props: Props) {
  const styles = useStyles();

  const {
    open,
    webinarID,
    sessionID,
    speakRequests,
    removeSpeakRequest,
    handleSnackbar,
    onClose,
    onAdd,
    removeGuestSpeaker,
  } = props;

  const [numViewers, setNumViewers] = useState(0);
  const [currentGuestSpeakers, setCurrentGuestSpeakers] = useState<GuestSpeaker[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [serverErr, setServerErr] = useState<string>();
  const [searchErr, setSearchedErr] = useState('');

  const {
    formFields,
    formErrors,
    handleChange,
    handleDateChange,
    updateFields,
    updateErrors,
    resetForm,
  } = useForm<IFormData>(defaultFormData);

  const { searchedUser } = formFields;

  useEffect(() => {
    if (open) {
      fetchData();
      setServerErr('');
    }
  }, [open]);

  const fetchData = useCallback(async () => {
    const { data } = await makeRequest<ViewersServiceResponse>(
      'GET',
      `/api/webinar/${webinarID}/getActiveViewers`
    );

    if (data['success'] === 1) {
      setNumViewers(data.content.users.length);
      if (data.content.currentSpeakers)
        setCurrentGuestSpeakers(data.content.currentSpeakers);
    } else {
      setCurrentGuestSpeakers([]);
      setNumViewers(0);
    }

    setLoading(false);
  }, []);

  const onAddClick = useCallback(async () => {
    if (!searchedUser) return setSearchedErr('Please enter a valid user');

    const { data } = await makeRequest('POST', '/proxy/webinar/inviteUserToSpeak', {
      userID: searchedUser._id,
      webinarID,
      sessionID,
    });

    if (data.success !== 1)
      return setServerErr('There was an error inviting this user');

    const guestSpeaker = { ...searchedUser };
    onAdd(guestSpeaker);

    handleSnackbar('Successfully invited user to speak.', 'success');

    updateFields([{ key: 'searchedUser', value: undefined }]);
    setServerErr('');
  }, [searchedUser, webinarID, sessionID]);

  const onAcceptRequest = useCallback(
    async (newSpeaker: SpeakRequestType) => {
      const { data } = await makeRequest(
        'POST',
        '/proxy/webinar/inviteUserToSpeak',
        {
          userID: newSpeaker._id,
          webinarID,
          sessionID,
        }
      );

      if (data.success !== 1)
        return setServerErr('There was an error inviting this user');

      const guestSpeaker = { ...newSpeaker };
      onAdd(guestSpeaker);

      handleSnackbar('Successfully invited user to speak.', 'success');

      updateFields([{ key: 'searchedUser', value: undefined }]);
      removeSpeakRequest(newSpeaker._id);
      setServerErr('');
    },
    [webinarID, sessionID]
  );

  const handleRemoveSpeaker = useCallback(
    async (speaker: GuestSpeaker) => {
      if (
        !window.confirm(
          `Are you sure you want to remove ${speaker!.firstName} ${
            speaker!.lastName
          } from the stream?`
        )
      )
        return;

      const { data } = await makeRequest(
        'POST',
        '/proxy/webinar/removeGuestSpeaker',
        {
          webinarID: webinarID,
          speakingToken: speaker.speakingToken,
        }
      );

      if (data.success !== 1 || !speaker?.connection?.connectionId)
        return setServerErr('There was an error trying to remove the speaker');

      removeGuestSpeaker(speaker.connection!);

      handleSnackbar('Successfully removed speaker.', 'notify');

      setCurrentGuestSpeakers((prevGuestSpeakers) => {
        let newGuestSpeakers = prevGuestSpeakers.slice();
        for (let i = 0; i < newGuestSpeakers.length; i++) {
          if (newGuestSpeakers[i]._id === speaker._id) {
            newGuestSpeakers.splice(i, 1);
            return newGuestSpeakers;
          }
        }
        return newGuestSpeakers;
      });
      setServerErr('');
    },
    [webinarID]
  );

  const onAutocomplete = (user: UserOption) => {
    updateFields([{ key: 'searchedUser', value: user }]);
  };

  const searchOptionMap = useCallback(
    (users: UserInfo[]): UserOption[] =>
      users.map((user) => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        connection: user?.connection,

        label: `${user.firstName} ${user.lastName}`,
        value: `${user.firstName} ${user.lastName} ${user.email} ${user._id}`,
      })) as UserOption[],
    []
  );

  const renderGuestSpeakers = () => {
    const speakers: any[] = [];

    currentGuestSpeakers.forEach((guestSpeaker) => {
      speakers.push(
        <div key={guestSpeaker._id} className={styles.guestSpeaker}>
          <div>
            <RSText
              className={[styles.guestSpeakerText, styles.selectedName].join(' ')}
            >
              {guestSpeaker?.firstName} {guestSpeaker?.lastName}
            </RSText>
            <RSText italic className={styles.guestSpeakerEmail}>
              {guestSpeaker?.email}
            </RSText>
          </div>
          <IconButton onClick={() => handleRemoveSpeaker(guestSpeaker)}>
            <IoMdClose color={colors.secondaryText} />
          </IconButton>
        </div>
      );
    });

    return (
      <div className={[styles.guestSpeakerContainer, styles.bottomBorder].join(' ')}>
        <RSText className={styles.bright}>
          <b>Current Guest Speakers</b>
        </RSText>
        {speakers}
      </div>
    );
  };

  const renderSelectedUserInfo = () => {
    return (
      <div style={{ marginBottom: 15 }}>
        <RSText className={styles.bright}>
          <b>Selected User</b>
        </RSText>

        <div className={styles.selectedUserAdd}>
          <div>
            <RSText
              className={[styles.guestSpeakerText, styles.selectedName].join(' ')}
            >
              {searchedUser?.firstName} {searchedUser?.lastName}
            </RSText>
            <RSText italic className={styles.guestSpeakerEmail}>
              {searchedUser?.email}
            </RSText>
          </div>
          <div className={styles.inviteButtonsContainer}>
            <Button
              className={styles.removeButton}
              size="small"
              onClick={() =>
                updateFields([{ key: 'searchedUser', value: undefined }])
              }
            >
              Cancel
            </Button>
            <Button
              className={styles.acceptButton}
              size="small"
              onClick={onAddClick}
            >
              Invite
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderAutoComplete = () => {
    return (
      <div className={[styles.autoCompleteContainer, styles.bottomBorder].join(' ')}>
        {searchedUser && renderSelectedUserInfo()}
        <UserSearch<UserOption, UserInfo>
          label="Viewers"
          className={styles.textField}
          name="viewers"
          onAutocomplete={onAutocomplete}
          fetchDataURL={`/api/webinar/${webinarID}/getActiveViewers`}
          mapData={searchOptionMap}
          helperText="Search current viewers"
          key="userSearch"
          error={formErrors.searchedUser}
        />
      </div>
    );
  };

  const renderSpeakRequests = () => {
    const requests: any[] = [];
    if (speakRequests.length === 0) return;

    speakRequests.forEach((speakRequest) => {
      requests.push(
        <div className={styles.speakRequestWrapper} key={speakRequest._id}>
          <RSText>{`${speakRequest.firstName} ${speakRequest.lastName}`}</RSText>
          <div className={styles.inviteButtonsContainer}>
            <Button
              className={styles.removeButton}
              size="small"
              onClick={() => removeSpeakRequest(speakRequest._id)}
            >
              Remove
            </Button>
            <Button
              className={styles.acceptButton}
              size="small"
              onClick={() => onAcceptRequest(speakRequest)}
            >
              Invite
            </Button>
          </div>
        </div>
      );
    });

    return (
      <div
        className={[styles.speakRequestsContainer, styles.bottomBorder].join(' ')}
      >
        <RSText className={styles.bright}>
          <b>Speaker Requests</b>
        </RSText>
        {requests}
      </div>
    );
  };

  return (
    <>
      <RSModal
        open={props.open}
        title={`Manage Event Speakers`}
        onClose={onClose}
        className={styles.modal}
        helperText={'Select viewers to bring on as guest speakers'}
        helperIcon={<BsPeopleFill size={90} />}
        serverErr={serverErr}
      >
        <div className={styles.modalWrapper}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 15,
                paddingBottom: 15,
              }}
            >
              <CircularProgress size={60} className={styles.loadingIndicator} />
            </div>
          ) : (
            <>
              {currentGuestSpeakers.length > 0 && renderGuestSpeakers()}
              {currentGuestSpeakers.length < 2 && renderAutoComplete()}
              {speakRequests.length > 0 && renderSpeakRequests()}

              <RSText
                type="body"
                color={colors.secondaryText}
                className={styles.activeViewerCount}
              >
                {numViewers} Active Viewer{numViewers !== 1 && 's'}
              </RSText>
            </>
          )}
        </div>
      </RSModal>
    </>
  );
}

export default MeetTheGreeksModal;
