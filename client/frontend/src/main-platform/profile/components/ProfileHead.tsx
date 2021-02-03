import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, Menu, MenuItem } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { makeRequest } from '../../../helpers/functions';
import { ProfileState, ConnectionRequestType } from '../../../helpers/types';
import Theme from '../../../theme/Theme';
import { putUpdateUserConnection } from '../../../api';

const ITEM_HEIGHT = 28;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 50,
    marginRight: 50,
  },
  headLeft: {
    flex: 1,
    textAlign: 'left',
    marginRight: 50,
  },
  headRight: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
  },
  connectionButtonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  allConnectionButtons: {
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 15,
  },
  connectButton: {
    color: Theme.white,
    background: Theme.bright,
    '&:hover': {
      background: Theme.brightHover,
    },
  },
  removeConnectionButton: {
    color: Theme.white,
    background: Theme.primary,
  },
  acceptConnectionButton: {
    color: Theme.white,
    background: Theme.primary,
    marginLeft: 7,
  },
  pendingConnectionButton: {
    color: Theme.white,
    background: Theme.primary,
  },
  connectedConnectionButton: {
    color: Theme.white,
    background: Theme.primary,
  },
  selfBioWrapper: {
    display: 'flex',
    marginTop: 7,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  bio: {},
  editIcon: {
    marginLeft: 5,
  },
  bioEditContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    marginTop: 7,
  },
  buttonContainer: {
    marginBottom: 2,
  },
  cancelButton: {
    marginLeft: 5,
    height: 35,
    color: Theme.white,
    background: Theme.primary,
  },
  saveButton: {
    marginLeft: 5,
    height: 35,
    color: Theme.white,
    background: Theme.primary,
  },
  numbers: {
    marginTop: 1,
  },
  textField: {
    [`& fieldset`]: {
      borderRadius: 9,
    },
    flex: 1,
    color: Theme.bright,
    borderRadius: 9,
    background: Theme.white,
  },
  cssLabel: {
    color: Theme.secondaryText,
  },
  cssFocused: {
    color: Theme.primary,
    borderWidth: '1px',
    borderColor: `${Theme.primary} !important`,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      // color: '#f2f2f2 !important',
      // label: '#f2f2f2 !important',
      borderWidth: '2px',
      borderColor: `${Theme.primary} !important`,
    },
  },
  notchedOutline: {
    borderWidth: '1px',
    label: Theme.white,
    borderColor: Theme.white,
    color: Theme.white,
  },
  navigationText: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  profileID: string;
  name: string;
  university: string;
  graduationYear: number;
  position: string;
  company: string;
  bio: string;
  numConnections: number;
  numMutualConnections?: number;
  numCommunities: number;
  numMutualCommunities?: number;
  currentProfileState: ProfileState;
  updateProfileState: () => void;

  accessToken: string;
  refreshToken: string;
};

function ProfileHead(props: Props) {
  const styles = useStyles();

  const [hoverBio, setHoverBio] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [originalBio, setOriginalBio] = useState(props.bio);
  const [updatedBio, setUpdatedBio] = useState('');

  const [numConnections, setNumConnections] = useState(0);
  const [connection, setConnection] = useState<ConnectionRequestType>();
  // TODO: use this to lock accept/remove buttons until the request ID has been loaded
  const [loadingConnection, setLoadingConnection] = useState(true);

  const menuOpen = Boolean(anchorEl);

  const mutualConnections =
    props.currentProfileState === 'SELF'
      ? ''
      : ` | ${props.numMutualConnections || 0} Mutual`;
  const mutualCommunities =
    props.currentProfileState === 'SELF'
      ? ''
      : ` | ${props.numMutualCommunities || 0} Mutual`;

  useEffect(() => {
    setNumConnections(props.numConnections);
  }, [props.numConnections]);

  useEffect(() => {
    if (
      props.currentProfileState === 'PENDING_TO' ||
      props.currentProfileState === 'PENDING_FROM' ||
      props.currentProfileState === 'CONNECTED'
    )
      fetchConnection();
  }, [props.currentProfileState]);

  async function fetchConnection() {
    const { data } = await makeRequest(
      'POST',
      '/user/getConnectionWithUser',
      { requestUserID: props.profileID },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setConnection(data['content']['connection']);
  }

  async function requestConnection() {
    const data = await putUpdateUserConnection('connect', props.profileID);
    if (data['success'] === 1) props.updateProfileState();
  }

  async function declineConnection() {
    const data = await putUpdateUserConnection('reject', props.profileID);
    if (data['success'] === 1) props.updateProfileState();
    setAnchorEl(null);
  }

  async function acceptConnection() {
    const data = await putUpdateUserConnection('accept', props.profileID);
    if (data['success'] === 1) {
      props.updateProfileState();
      setNumConnections((prevNumConnections) => prevNumConnections + 1);
    }
  }

  async function cancelRequest() {
    const data = await putUpdateUserConnection('cancel', props.profileID);
    if (data['success'] === 1) props.updateProfileState();
    setAnchorEl(null);
  }

  async function removeConnection() {
    const data = await putUpdateUserConnection('remove', props.profileID);
    if (data['success'] === 1) {
      props.updateProfileState();
      setNumConnections((prevNumConnections) =>
        prevNumConnections - 1 >= 0 ? prevNumConnections - 1 : 0
      );
    }
    setAnchorEl(null);
  }

  async function submitEditedBio() {
    setEditBio(false);
    const trimmed = updatedBio.trim();
    setOriginalBio(trimmed);

    const { data } = await makeRequest(
      'POST',
      '/user/updateBio',
      {
        newBio: trimmed,
      },
      true,
      props.accessToken,
      props.refreshToken
    );
  }

  ////// END REQUEST FUNCTIONS
  ////// START HANLDER FUNCTIONS

  function handleMouseOver() {
    setHoverBio(true);
  }

  function handleMouseLeave() {
    setHoverBio(false);
  }

  function startEditingBio() {
    setUpdatedBio(originalBio);
    setEditBio(true);
  }

  function cancelEditingBio() {
    setEditBio(false);
    setUpdatedBio(originalBio);
  }

  function handleBioChange(event: any) {
    setUpdatedBio(event.target.value);
  }

  function handleOptionsClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  ////// END HANDLER FUNCTIONS
  ////// START RENDERS

  function renderEditTextField() {
    return (
      <TextField
        multiline
        type="search"
        label="Bio"
        variant="outlined"
        size="small"
        className={styles.textField}
        onChange={handleBioChange}
        value={updatedBio}
        InputLabelProps={{
          classes: {
            root: styles.cssLabel,
            focused: styles.cssFocused,
          },
        }}
        InputProps={{
          classes: {
            root: styles.cssOutlinedInput,
            focused: styles.cssFocused,
            notchedOutline: styles.notchedOutline,
          },
          inputMode: 'numeric',
        }}
      />
    );
  }

  function renderOptions() {
    return (
      <div>
        {props.currentProfileState === 'PENDING_TO' && (
          <MenuItem onClick={cancelRequest}>Cancel Request</MenuItem>
        )}
        {props.currentProfileState === 'CONNECTED' && (
          <MenuItem onClick={removeConnection}>Remove Connection</MenuItem>
        )}
      </div>
    );
  }

  function renderConnectionButton() {
    if (props.currentProfileState === 'SELF') return;

    let buttonStyles = [styles.allConnectionButtons];
    let buttonText = 'Connect';
    let clickHandler: any = requestConnection;

    if (props.currentProfileState === 'PENDING_TO') {
      buttonStyles.push(styles.pendingConnectionButton);
      buttonText = 'Requested';
      clickHandler = handleOptionsClick;
    } else if (props.currentProfileState === 'PENDING_FROM') {
      buttonStyles.push(styles.removeConnectionButton);
      buttonText = 'Remove';
      clickHandler = declineConnection;
    } else if (props.currentProfileState === 'CONNECTED') {
      buttonStyles.push(styles.connectedConnectionButton);
      buttonText = 'Connected';
      clickHandler = handleOptionsClick;
    } else buttonStyles.push(styles.connectButton);

    return (
      <div className={styles.connectionButtonContainer}>
        <Button
          variant="contained"
          className={buttonStyles.join(' ')}
          onClick={clickHandler}
          size="large"
        >
          {buttonText}
        </Button>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
            },
          }}
        >
          {renderOptions()}
        </Menu>
        {props.currentProfileState === 'PENDING_FROM' && (
          <Button
            variant="contained"
            className={[
              styles.allConnectionButtons,
              styles.acceptConnectionButton,
            ].join(' ')}
            onClick={acceptConnection}
            size="large"
          >
            Accept
          </Button>
        )}
      </div>
    );
  }

  function renderSelfBio() {
    const showIcon =
      hoverBio || !originalBio || originalBio.length === 0 ? 'visible' : 'hidden';
    return (
      <div
        className={styles.selfBioWrapper}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onClick={startEditingBio}
      >
        <RSText
          type="subhead"
          size={12}
          color={Theme.primary}
          className={styles.bio}
        >
          {originalBio}
        </RSText>
        <CreateIcon
          fontSize="small"
          className={styles.editIcon}
          style={{ visibility: showIcon }}
        />
      </div>
    );
  }

  function renderOtherBio() {
    return (
      <RSText type="subhead" size={14} color={Theme.primary} className={styles.bio}>
        {originalBio}
      </RSText>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headLeft}>
        <RSText type="head" size={18} bold color={Theme.primaryText}>
          {props.name}
        </RSText>
        {props.university && (
          <RSText type="subhead" size={12} color={Theme.secondaryText}>
            {`${props.university} ${props.graduationYear || ''}`}
          </RSText>
        )}
        <RSText type="subhead" size={12} color={Theme.secondaryText}>
          {`${(props.position && `${props.position}, `) || ''} ${props.company ||
            ''}`}
        </RSText>
        {editBio ? (
          <div className={styles.bioEditContainer}>
            {renderEditTextField()}
            <div className={styles.buttonContainer}>
              <Button className={styles.cancelButton} onClick={cancelEditingBio}>
                Cancel
              </Button>
              <Button className={styles.saveButton} onClick={submitEditedBio}>
                Save
              </Button>
            </div>
          </div>
        ) : props.currentProfileState === 'SELF' ? (
          renderSelfBio()
        ) : (
          renderOtherBio()
        )}
      </div>
      <div className={styles.headRight}>
        {renderConnectionButton()}
        <a
          href={`/connections/${
            props.currentProfileState === 'SELF' ? 'user' : props.profileID
          }`}
          className={styles.navigationText}
        >
          <RSText
            type="subhead"
            size={12}
            color={Theme.primaryText}
            className={styles.numbers}
          >
            {numConnections || 0} Connections {mutualConnections}
          </RSText>
        </a>
        <a
          href={`/communities/${
            props.currentProfileState === 'SELF' ? 'user' : props.profileID
          }`}
          className={styles.navigationText}
        >
          <RSText
            type="subhead"
            size={12}
            color={Theme.primaryText}
            className={styles.numbers}
          >
            {props.numCommunities || 0} Communities {mutualCommunities}
          </RSText>
        </a>
      </div>
    </div>
  );
}

export default ProfileHead;
