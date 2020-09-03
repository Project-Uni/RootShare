import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField, Menu, MenuItem } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { makeRequest } from '../../../helpers/functions';
import { ProfileState, ConnectionRequestType } from '../../../helpers/types';

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
    textAlign: 'left',
  },
  connectionButtonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  allConnectionButtons: {
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 15,
  },
  connectButton: {
    color: colors.primaryText,
    background: colors.bright,
    '&:hover': {
      background: colors.primary,
    },
  },
  removeConnectionButton: {
    color: colors.primaryText,
    background: 'gray',
  },
  acceptConnectionButton: {
    color: colors.primaryText,
    background: colors.bright,
    marginLeft: 7,
  },
  pendingConnectionButton: {
    color: colors.primaryText,
    background: colors.secondary,
  },
  connectedConnectionButton: {
    color: colors.primaryText,
    background: colors.secondary,
  },
  selfBioContainer: {
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
    color: colors.primaryText,
    background: colors.second,
  },
  saveButton: {
    marginLeft: 5,
    height: 35,
    color: colors.primaryText,
    background: colors.second,
  },
  numbers: {
    marginTop: 1,
  },
  textField: {
    [`& fieldset`]: {
      borderRadius: 9,
    },
    flex: 1,
    color: colors['shade-one'],
    borderRadius: 9,
    background: '#e9e9e9',
  },
  cssLabel: {
    color: colors.secondaryText,
  },
  cssFocused: {
    color: colors.first,
    borderWidth: '1px',
    borderColor: `${colors.first} !important`,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      // color: '#f2f2f2 !important',
      // label: '#f2f2f2 !important',
      borderWidth: '2px',
      borderColor: `${colors.second} !important`,
    },
  },
  notchedOutline: {
    borderWidth: '1px',
    label: colors.primaryText,
    borderColor: colors.primaryText,
    color: colors.primaryText,
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
  currentProfileState: ProfileState;
  updateProfileState: () => void;

  accessToken: string;
  refreshToken: string;
};

function ProfileHead(props: Props) {
  const styles = useStyles();

  const [hoverBio, setHoverBio] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [originalBio, setOriginalBio] = useState(props.bio);
  const [updatedBio, setUpdatedBio] = useState('');

  const [numConnections, setNumConnections] = useState(0);
  const [connection, setConnection] = useState<ConnectionRequestType>();
  // TODO: use this to lock accept/remove buttons until the request ID has been loaded
  const [loadingConnection, setLoadingConnection] = useState(true);

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    setNumConnections(props.numConnections);
  }, [props.numConnections]);

  useEffect(() => {
    if (
      props.currentProfileState === 'TO' ||
      props.currentProfileState === 'FROM' ||
      props.currentProfileState === 'CONNECTION'
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
    const { data } = await makeRequest(
      'POST',
      '/user/requestConnection',
      {
        requestUserID: props.profileID,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) props.updateProfileState();
  }

  async function declineConnection() {
    const { data } = await makeRequest(
      'POST',
      '/user/respondConnection',
      {
        requestID: connection?._id,
        accepted: false,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) props.updateProfileState();
    setAnchorEl(null);
  }

  async function acceptConnection() {
    const { data } = await makeRequest(
      'POST',
      '/user/respondConnection',
      {
        requestID: connection?._id,
        accepted: true,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) {
      props.updateProfileState();
      setNumConnections((prevNumConnections) => prevNumConnections + 1);
    }
  }

  async function removeConnection() {
    const { data } = await makeRequest(
      'POST',
      '/user/respondConnection',
      {
        requestID: connection?._id,
        accepted: false,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

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
        {props.currentProfileState === 'TO' && (
          <MenuItem onClick={declineConnection}>Cancel Request</MenuItem>
        )}
        {props.currentProfileState === 'CONNECTION' && (
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

    if (props.currentProfileState === 'TO') {
      buttonStyles.push(styles.pendingConnectionButton);
      buttonText = 'Requested';
      clickHandler = handleOptionsClick;
    } else if (props.currentProfileState === 'FROM') {
      buttonStyles.push(styles.removeConnectionButton);
      buttonText = 'Remove';
      clickHandler = declineConnection;
    } else if (props.currentProfileState === 'CONNECTION') {
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
        {props.currentProfileState === 'FROM' && (
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
    return (
      <div
        className={styles.selfBioContainer}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onClick={startEditingBio}
      >
        <RSText
          type="subhead"
          size={14}
          color={colors.second}
          className={styles.bio}
        >
          {originalBio}
        </RSText>

        {(hoverBio || !originalBio || originalBio.length === 0) && (
          <CreateIcon fontSize="small" className={styles.editIcon} />
        )}
      </div>
    );
  }

  function renderOtherBio() {
    return (
      <RSText type="subhead" size={14} color={colors.second} className={styles.bio}>
        {originalBio}
      </RSText>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headLeft}>
        <RSText type="head" size={24} bold color={colors.second}>
          {props.name}
        </RSText>
        <RSText type="subhead" size={14} color={colors.secondaryText}>
          {props.university + ' ' + props.graduationYear}
        </RSText>
        <RSText type="subhead" size={14} color={colors.secondaryText}>
          {props.position + ', ' + props.company}
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
        <RSText
          type="subhead"
          size={12}
          color={colors.second}
          className={styles.numbers}
        >
          {numConnections} Connections
        </RSText>
        {props.currentProfileState === 'SELF' || (
          <RSText
            type="subhead"
            size={12}
            color={colors.second}
            className={styles.numbers}
          >
            {props.numMutualConnections} Mutual
          </RSText>
        )}
        <RSText
          type="subhead"
          size={12}
          color={colors.second}
          className={styles.numbers}
        >
          {props.numCommunities} Communities
        </RSText>
      </div>
    </div>
  );
}

export default ProfileHead;
