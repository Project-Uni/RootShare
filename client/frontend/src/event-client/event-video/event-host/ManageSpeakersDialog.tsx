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
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  loadingIndicator: {
    color: theme.primary,
  },
  text: {
    color: colors.primaryText,
  },
  bright: {
    color: colors.bright,
    marginBottom: 6,
  },
  selectedName: {
    marginBottom: 3,
  },
  textField: {
    width: 460,
  },
  speakRequestsContainer: {
    marginTop: 10,
    borderTopStyle: 'solid',
  },
  speakRequestWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 5,
  },
  requestButtonContainer: {
    display: 'flex',
  },
  removeButton: {
    color: colors.primaryText,
    background: 'gray',
    height: 27,
    marginTop: 7,
  },
  acceptButton: {
    color: colors.primaryText,
    background: colors.bright,
    height: 27,
    marginTop: 7,
    marginLeft: 7,
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
  currentSpeaker: UserInfo;
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
  const [currentSpeaker, setCurrentSpeaker] = useState<UserInfo>();

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
      if (data.content.currentSpeaker)
        setCurrentSpeaker(data.content.currentSpeaker);
    } else setCurrentSpeaker(undefined);

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

  const handleRemoveSpeaker = useCallback(async () => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${currentSpeaker!.firstName} ${
          currentSpeaker!.lastName
        } from the stream?`
      )
    )
      return;

    const { data } = await makeRequest('POST', '/proxy/webinar/removeGuestSpeaker', {
      webinarID: webinarID,
    });

    if (data.success !== 1 || !currentSpeaker?.connection?.connectionId)
      return setServerErr('There was an error trying to remove the speaker');

    removeGuestSpeaker(currentSpeaker.connection!);

    handleSnackbar('Successfully removed speaker.', 'notify');

    setCurrentSpeaker(undefined);
    setServerErr('');
  }, [currentSpeaker, webinarID]);

  const onAutocomplete = (user: UserOption) => {
    updateFields([{ key: 'searchedUser', value: user }]);
  };

  const renderCurrentSpeaker = () => {
    return (
      <>
        <RSText className={styles.bright}>
          <b>Current Speaker</b>
        </RSText>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <RSText className={[styles.text, styles.selectedName].join(' ')}>
            {currentSpeaker?.firstName} {currentSpeaker?.lastName}
          </RSText>
          <IconButton onClick={handleRemoveSpeaker}>
            <IoMdClose color={colors.secondaryText} />
          </IconButton>
        </div>

        <RSText className={styles.text}>{currentSpeaker?.email}</RSText>
      </>
    );
  };

  const renderSelectedUserInfo = () => {
    return (
      <div style={{ marginBottom: 15 }}>
        <RSText className={styles.bright}>
          <b>Selected User</b>
        </RSText>
        <RSText className={[styles.text, styles.selectedName].join(' ')}>
          {searchedUser?.firstName} {searchedUser?.lastName}
        </RSText>
        <RSText className={styles.text}>{searchedUser?.email}</RSText>
      </div>
    );
  };

  const renderAutoComplete = () => {
    return (
      <>
        <UserSearch<UserOption, UserInfo>
          label="Viewers"
          className={styles.textField}
          name="viewers"
          onAutocomplete={onAutocomplete}
          fetchDataURL={`/api/webinar/${webinarID}/getActiveViewers`}
          helperText="Search current viewers"
          key="userSearch"
          error={formErrors.searchedUser}
        />
        {!currentSpeaker && (
          <RSButton onClick={onAddClick} className={styles.text} disabled={loading}>
            Add User
          </RSButton>
        )}
      </>
    );
  };

  const renderRequests = () => {
    return <div />;
  };

  // function renderAutoComplete() {
  //   return (
  //     <Autocomplete
  //       style={{ width: 400, marginBottom: '20px' }}
  //       options={options}
  //       getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
  //       onChange={handleAutocompleteChange}
  //       renderInput={(params) => (
  //         <TextField
  //           {...params}
  //           label="Find a user"
  //           variant="outlined"
  //           fullWidth
  //           value={searchedUser}
  //           error={searchErr !== ''}
  //           helperText={searchErr}
  //           className={styles.textField}
  //         />
  //       )}
  //     />
  //   );
  // }

  const renderSpeakRequests = () => {
    const requests: any[] = [];
    if (speakRequests.length === 0) return;

    speakRequests.forEach((speakRequest) => {
      requests.push(
        <div className={styles.speakRequestWrapper} key={speakRequest._id}>
          <RSText>{`${speakRequest.firstName} ${speakRequest.lastName}`}</RSText>
          <div className={styles.requestButtonContainer}>
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

    return <div className={styles.speakRequestsContainer}>{requests}</div>;
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
        <div>
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
              {searchedUser && renderSelectedUserInfo()}
              {currentSpeaker ? renderCurrentSpeaker() : renderAutoComplete()}
              {serverErr && (
                <RSText type="body" color={'red'} size={11} italic>
                  {serverErr}
                </RSText>
              )}
              <RSText type="body" color={colors.secondaryText}>
                {numViewers} Active Viewer{numViewers !== 1 && 's'}
              </RSText>
              {renderSpeakRequests()}
            </>
          )}
        </div>
      </RSModal>
    </>
  );
}

export default MeetTheGreeksModal;
