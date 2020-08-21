import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  IconButton,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';

import { HostType } from '../../helpers/types';

import HypeCard from '../../hype-page/hype-card/HypeCard';
import RSText from '../../base-components/RSText';
import UserAutocomplete from '../event-creator/UserAutocomplete';

import { colors } from '../../theme/Colors';

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
  editing?: boolean;
};

function AdminCreateCommunity(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [admin, setAdmin] = useState<HostType | {}>({});
  const [type, setType] = useState('');

  const [adminErr, setAdminErr] = useState('');

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
        <FormControl className={styles.communitySelect} variant="outlined">
          <InputLabel id="demo-simple-select-label">Type</InputLabel>
          <Select value={type} onChange={handleCommunityTypeChange}>
            {COMMUNITY_TYPES.map((communityType) => (
              <MenuItem value={communityType} key={communityType}>
                {communityType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
      </div>

      //Remaining Fields: Admin, Private, Type
    );
  }
  return (
    <div className={styles.wrapper}>
      <HypeCard
        width={440}
        loading={loading}
        headerText={props.editing ? 'Edit Community' : 'Create a New Community'}
      >
        {renderBody()}
        <Button className={styles.createButton} size="large">
          {props.editing ? 'Save Changes' : 'Create Community'}
        </Button>
      </HypeCard>
    </div>
  );
}

export default AdminCreateCommunity;
