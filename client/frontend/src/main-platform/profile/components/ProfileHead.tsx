import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Button, TextField } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { makeRequest } from '../../../helpers/functions';

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
    width: 125,
  },
  connectButton: {
    color: colors.primaryText,
    background: colors.bright,
    paddingLeft: 25,
    paddingRight: 25,
    marginBottom: 15,
    '&:hover': {
      background: colors.primary,
    },
  },
  bioContainer: {
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
  userID: string;
  name: string;
  university: string;
  graduationYear: number;
  position: string;
  company: string;
  bio: string;
  numConnections: number;
  numMutualConnections?: number;
  numCommunities: number;
  editable?: boolean;

  accessToken: string;
  refreshToken: string;
};

function ProfileHead(props: Props) {
  const styles = useStyles();

  const [hoverBio, setHoverBio] = useState(false);
  const [editBio, setEditBio] = useState(false);

  const [originalBio, setOriginalBio] = useState('');
  const [updatedBio, setUpdatedBio] = useState('');

  useEffect(() => {
    setOriginalBio(props.bio);
  }, [props.bio]);

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

  function handleBioChange(event: any) {
    setUpdatedBio(event.target.value);
  }

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
        ) : (
          <div
            className={styles.bioContainer}
            onMouseEnter={props.editable ? handleMouseOver : undefined}
            onMouseLeave={props.editable ? handleMouseLeave : undefined}
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

            {(hoverBio || !originalBio || originalBio.length === 0) &&
              props.editable && (
                <CreateIcon fontSize="small" className={styles.editIcon} />
              )}
          </div>
        )}
      </div>
      <div className={styles.headRight}>
        {props.editable || (
          <Button variant="contained" className={styles.connectButton} size="large">
            Connect
          </Button>
        )}
        <RSText
          type="subhead"
          size={12}
          color={colors.second}
          className={styles.numbers}
        >
          {props.numConnections} Connections
        </RSText>
        {props.editable || (
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
