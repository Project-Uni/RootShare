import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
  Button,
  CircularProgress,
} from '@material-ui/core';

import { FaHome } from 'react-icons/fa';

import { makeRequest, slideLeft } from '../../../helpers/functions';

import { RSModal } from '../../reusable-components';
import { RSText } from '../../../base-components';
import { colors } from '../../../theme/Colors';
import { Community } from '../../../helpers/types';

import ManageSpeakersSnackbar from '../../../event-client/event-video/event-host/ManageSpeakersSnackbar';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 450,
  },
  textField: {
    width: 400,
  },
  fieldLabel: {
    textAlign: 'left',
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 8,
  },
  communitySelect: {
    width: 225,
    textAlign: 'left',
  },
  communitySelectDiv: {
    width: 400,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  privateSelect: {
    width: 150,
    textAlign: 'left',
  },
  createButton: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: 300,
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: colors.ternary,
    },
  },
  disabledButton: {
    background: 'lightgray',
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: 300,
  },
}));

type CommunityType =
  | 'Social'
  | 'Business'
  | 'Just for Fun'
  | 'Athletics'
  | 'Student Organization'
  | 'Academic';

const COMMUNITY_TYPES = [
  'Social',
  'Business',
  'Just for Fun',
  'Athletics',
  'Student Organization',
  'Academic',
];

type Props = {
  open: boolean;
  onClose: () => any;
  appendCommunity: (community: Community) => any;
};

function CreateCommunityModal(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<CommunityType>();
  const [isPrivate, setIsPrivate] = useState('no');

  const [nameErr, setNameErr] = useState('');
  const [descErr, setDescErr] = useState('');
  const [typeErr, setTypeErr] = useState('');

  const [serverErr, setServerErr] = useState(false);

  const [transition, setTransition] = useState<any>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);

  const helperText =
    'Post to the community, broadcast to the university, and follow and post to other communities';

  useEffect(() => {
    if (props.open) {
      setServerErr(false);
      setName('');
      setDesc('');
      setType(undefined);
      setIsPrivate('no');

      setNameErr('');
      setDescErr('');
      setTypeErr('');
    }
  }, [props.open]);

  function handleNameChange(event: any) {
    setName(event.target.value);
  }

  function handleDescChange(event: any) {
    setDesc(event.target.value);
  }

  function handleCommunityTypeChange(event: any) {
    setType(event.target.value);
  }

  function handlePrivateChange(event: any) {
    setIsPrivate(event.target.value);
  }

  function validateInput() {
    let hasErr = false;
    if (name === '') {
      setNameErr('Name is required.');
      hasErr = true;
    } else setNameErr('');

    if (desc === '') {
      setDescErr('Description is required.');
      hasErr = true;
    } else setDescErr('');

    if (!type) {
      setTypeErr('Community type is required.');
      hasErr = true;
    } else setTypeErr('');

    return hasErr;
  }

  async function handleCreateClicked() {
    setServerErr(false);
    setLoading(true);
    const hasErrors = validateInput();
    if (hasErrors) {
      setLoading(false);
      return;
    }

    const isPrivateBool = isPrivate === 'yes' ? true : false;

    const { data } = await makeRequest('POST', '/api/community/create', {
      name,
      description: desc,
      type,
      isPrivate: isPrivateBool,
    });

    if (data.success === 1) {
      setServerErr(false);
      setName('');
      setDesc('');
      setType(undefined);
      setIsPrivate('no');

      props.appendCommunity(data.content.community);
      props.onClose();

      setSnackbarMessage('Successfully created community');
      setSnackbarMode('notify');
      setTransition(() => slideLeft);
    } else {
      setServerErr(true);
    }
    setLoading(false);
  }

  function renderCommunityTypeSelect() {
    return (
      <div className={styles.communitySelectDiv}>
        <FormControl
          className={styles.communitySelect}
          variant="outlined"
          error={typeErr !== ''}
        >
          <InputLabel>Type</InputLabel>
          <Select value={type} onChange={handleCommunityTypeChange}>
            {COMMUNITY_TYPES.map((communityType) => (
              <MenuItem value={communityType} key={communityType}>
                {communityType}
              </MenuItem>
            ))}
          </Select>
          {typeErr !== '' && <FormHelperText>{typeErr}</FormHelperText>}
        </FormControl>
      </div>
    );
  }

  function renderPrivateSelect() {
    return (
      <div className={styles.communitySelectDiv}>
        <FormControl className={styles.privateSelect} variant="outlined">
          <InputLabel>Private</InputLabel>
          <Select value={isPrivate} onChange={handlePrivateChange}>
            <MenuItem value={'yes'}>Yes</MenuItem>
            <MenuItem value={'no'}>No</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }

  return (
    <>
      <ManageSpeakersSnackbar
        mode={snackbarMode}
        message={snackbarMessage}
        transition={transition}
        handleClose={() => setSnackbarMode(null)}
      />
      <RSModal
        open={props.open}
        title="Create Community"
        onClose={props.onClose}
        className={styles.wrapper}
        helperText={helperText}
        helperIcon={<FaHome color="black" size={64} />}
      >
        <div style={{ marginLeft: 20, marginRight: 20 }}>
          <RSText type="body" bold size={12} className={styles.fieldLabel}>
            Community Name
          </RSText>
          <TextField
            variant="outlined"
            value={name}
            label="Community Name"
            className={styles.textField}
            onChange={handleNameChange}
            error={nameErr !== ''}
            helperText={nameErr !== '' ? nameErr : null}
          />

          <RSText type="body" bold size={12} className={styles.fieldLabel}>
            Description
          </RSText>
          <TextField
            variant="outlined"
            value={desc}
            label="Description"
            className={styles.textField}
            multiline
            onChange={handleDescChange}
            error={descErr !== ''}
            helperText={descErr !== '' ? descErr : null}
          />

          <RSText type="body" bold size={12} className={styles.fieldLabel}>
            Community Type
          </RSText>
          {renderCommunityTypeSelect()}

          <RSText type="body" bold size={12} className={styles.fieldLabel}>
            Private
          </RSText>
          {renderPrivateSelect()}

          <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
            <Button
              className={loading ? styles.disabledButton : styles.createButton}
              disabled={loading}
              onClick={handleCreateClicked}
            >
              {loading ? <CircularProgress size={30} /> : 'Create'}
            </Button>
          </div>
          {serverErr && (
            <RSText color={colors.brightError} italic>
              There was an error creating the community.
            </RSText>
          )}
        </div>
      </RSModal>
    </>
  );
}

export default CreateCommunityModal;
