import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  IconButton,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
} from '@material-ui/core';

import { HostType, Community } from '../../helpers/types';

import HypeCard from '../../hype-page/hype-card/HypeCard';
import RSText from '../../base-components/RSText';
import UserAutocomplete from '../event-creator/UserAutocomplete';

import { colors } from '../../theme/Colors';
import { makeRequest } from '../../helpers/functions';
import { CommunityType, COMMUNITY_TYPES } from '../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: { marginTop: 20 },
  body: {
    marginTop: 20,
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
  communityAdmin: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  createButton: {
    width: 400,
    background: colors.bright,
    color: colors.primaryText,
    marginTop: 30,
  },
  cancelButton: {
    width: 400,
    marginTop: 20,
  },
  deleteButton: {
    width: 400,
    marginTop: 20,
    color: colors.brightError,
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
}));

type Props = {
  editing?: boolean;
  editingCommunity?: Community;
  accessToken: string;
  refreshToken: string;
  appendNewCommunity: (community: Community) => void;
  onCancelEdit: () => void;
  onUpdateCommunity: () => void;
  onDeleteCommunity: (communityID: string) => void;
};

function AdminCreateCommunity(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [admin, setAdmin] = useState<HostType | {}>({});
  const [type, setType] = useState<CommunityType>();
  const [isPrivate, setIsPrivate] = useState('no');
  const [scaleEventType, setScaleEventType] = useState<string>();

  const [serverMessage, setServerMessage] = useState<{
    success: boolean;
    message: string;
  }>();

  const [nameErr, setNameErr] = useState('');
  const [descErr, setDescErr] = useState('');
  const [adminErr, setAdminErr] = useState('');
  const [typeErr, setTypeErr] = useState('');

  useEffect(() => {
    if (props.editing && props.editingCommunity) {
      const { editingCommunity } = props;
      setName(editingCommunity.name);
      setDesc(editingCommunity.description);
      setAdmin(editingCommunity.admin);
      setType(editingCommunity.type);
      setScaleEventType(editingCommunity.scaleEventType);
      setIsPrivate(editingCommunity.private ? 'yes' : 'no');

      setNameErr('');
      setDescErr('');
      setAdminErr('');
      setTypeErr('');
    }
  }, [props.editing]);

  function onCancelEdit() {
    setName('');
    setDesc('');
    setAdmin({});
    setType(undefined);
    setIsPrivate('no');
    setScaleEventType(undefined);

    setNameErr('');
    setDescErr('');
    setAdminErr('');
    setTypeErr('');

    props.onCancelEdit();
  }

  async function onDeleteCommunity() {
    if (
      window.confirm(
        'Are you sure you want to delete this community? This action is irreversible.'
      )
    ) {
      const communityID = (props.editingCommunity as Community)._id;
      const { data } = await makeRequest(
        'DELETE',
        `/api/admin/community/${communityID}`
      );

      if (data.success !== 1)
        return setServerMessage({
          success: false,
          message: `There was an error deleting the community ${name}`,
        });

      setServerMessage({
        success: true,
        message: `Successfully deleted community ${name}`,
      });
      onCancelEdit();
      props.onDeleteCommunity(communityID);
    }
  }

  function handleNameChange(event: any) {
    setName(event.target.value);
  }

  function handleDescChange(event: any) {
    setDesc(event.target.value);
  }

  function handleAdminChange(_: any, newValue: any) {
    if (newValue === null) {
      setAdmin({});
    } else {
      setAdmin(newValue);
    }
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

    if (Object.keys(admin).length === 0) {
      setAdminErr('Community admin is required.');
      hasErr = true;
    } else setAdminErr('');

    if (!type) {
      setTypeErr('Community type is required.');
      hasErr = true;
    } else setTypeErr('');

    return hasErr;
  }

  async function handleCreateCommunity() {
    setLoading(true);
    const hasErrors = validateInput();
    if (hasErrors) {
      setLoading(false);
      return;
    }

    const isPrivateBool = isPrivate === 'yes' ? true : false;

    const { data } = await makeRequest('POST', '/api/admin/community/create', {
      name,
      description: desc,
      adminID: (admin as HostType)._id,
      type,
      isPrivate: isPrivateBool,
      scaleEventType,
    });

    if (data.success === 1) {
      setName('');
      setDesc('');
      setAdmin({});
      setType(undefined);
      setIsPrivate('no');
      setScaleEventType(undefined);
      setServerMessage({
        success: true,
        message: `Successfully created community ${name}`,
      });
      props.appendNewCommunity(data.content['community']);
    } else {
      setServerMessage({ success: false, message: `${data.message}` });
    }
    setLoading(false);
  }

  async function handleEditCommunity() {
    setLoading(true);
    const hasErrors = validateInput();
    if (hasErrors) {
      setLoading(false);
      return;
    }

    const isPrivateBool = isPrivate === 'yes' ? true : false;

    const { data } = await makeRequest('POST', '/api/admin/community/edit', {
      _id: (props.editingCommunity as Community)._id,
      name,
      description: desc,
      adminID: (admin as HostType)._id,
      type,
      isPrivate: isPrivateBool,
      scaleEventType,
    });

    if (data.success === 1) {
      setName('');
      setDesc('');
      setAdmin({});
      setType(undefined);
      setIsPrivate('no');
      setScaleEventType(undefined);
      setServerMessage({
        success: true,
        message: `Successfully created community ${name}`,
      });
      props.onCancelEdit();
      props.onUpdateCommunity();
    } else {
      setServerMessage({ success: false, message: `${data.message}` });
    }
    setLoading(false);
  }

  function renderAdmin() {
    const currAdmin = admin as HostType;
    return (
      <div className={styles.communityAdmin}>
        <RSText type="subhead" size={14}>
          {`${currAdmin.firstName} ${currAdmin.lastName}`}
        </RSText>
        <RSText type="subhead" italic size={11}>
          {currAdmin.email}
        </RSText>
        <IconButton
          onClick={() => {
            setAdmin({});
          }}
        >
          <RSText type="subhead">X</RSText>
        </IconButton>
      </div>
    );
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

  const MeetTheGreeksSelect = () => {
    return (
      <div className={styles.communitySelectDiv}>
        <FormControl className={styles.privateSelect} variant="outlined">
          <InputLabel>Scale Event Type</InputLabel>
          <Select
            value={scaleEventType}
            onChange={(e: any) => setScaleEventType(e.target.value)}
          >
            <MenuItem value={'mtg'}>Meet The Greeks</MenuItem>
            <MenuItem value={'grand-prix'}>Grand Prix</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  };

  function renderServerMessage() {
    if (!serverMessage) return null;
    const messageType = serverMessage.success ? 'success' : 'fail'; //  's' if success, 'f' if error
    const messageContent = serverMessage.message;

    return (
      <div style={{ width: 400, textAlign: 'left', marginTop: 10 }}>
        <RSText
          type="body"
          size={14}
          bold
          color={messageType === 'success' ? colors.success : colors.brightError}
        >
          {messageContent}
        </RSText>
      </div>
    );
  }

  function renderBody() {
    return (
      <div className={styles.body}>
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
          Community Admin
        </RSText>
        {Object.keys(admin).length > 0 && renderAdmin()}
        <UserAutocomplete
          handleAutoCompleteChange={handleAdminChange}
          value={(admin as HostType).firstName}
          label="Admin"
          err={adminErr}
        />

        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Community Type
        </RSText>
        {renderCommunityTypeSelect()}

        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Private
        </RSText>
        {renderPrivateSelect()}
        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Scale Event Type
        </RSText>
        <MeetTheGreeksSelect />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <HypeCard
        width={440}
        loading={loading}
        headerText={props.editing ? 'Edit Community' : 'Create a New Community'}
      >
        {renderServerMessage()}
        {renderBody()}

        <Button
          className={styles.createButton}
          size="large"
          onClick={props.editing ? handleEditCommunity : handleCreateCommunity}
        >
          {props.editing ? 'Save Changes' : 'Create Community'}
        </Button>
        {props.editing && (
          <>
            <Button
              size="large"
              className={styles.cancelButton}
              onClick={onCancelEdit}
            >
              Cancel Update
            </Button>
            <Button
              size="large"
              className={styles.deleteButton}
              onClick={onDeleteCommunity}
            >
              Delete Community
            </Button>
          </>
        )}
      </HypeCard>
    </div>
  );
}

export default AdminCreateCommunity;
