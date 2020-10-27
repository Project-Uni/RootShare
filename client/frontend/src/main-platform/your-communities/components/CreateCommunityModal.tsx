import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
  Button,
} from '@material-ui/core';

import { RSModal } from '../../reusable-components';
import { RSText } from '../../../base-components';
import { colors } from '../../../theme/Colors';

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
};

function CreateCommunityModal(props: Props) {
  const styles = useStyles();

  const helperText =
    'Post to the community, broadcast to the university, and follow and post to other communities';

  function renderCommunityTypeSelect() {
    return (
      <div className={styles.communitySelectDiv}>
        <FormControl
          className={styles.communitySelect}
          variant="outlined"
          // error={typeErr !== ''}
        >
          <InputLabel>Type</InputLabel>
          <Select
          // value={type} onChange={handleCommunityTypeChange}
          >
            {COMMUNITY_TYPES.map((communityType) => (
              <MenuItem value={communityType} key={communityType}>
                {communityType}
              </MenuItem>
            ))}
          </Select>
          {/* {typeErr !== '' && <FormHelperText>{typeErr}</FormHelperText>} */}
        </FormControl>
      </div>
    );
  }

  function renderPrivateSelect() {
    return (
      <div className={styles.communitySelectDiv}>
        <FormControl className={styles.privateSelect} variant="outlined">
          <InputLabel>Private</InputLabel>
          <Select
          // value={isPrivate} onChange={handlePrivateChange}
          >
            <MenuItem value={'yes'}>Yes</MenuItem>
            <MenuItem value={'no'}>No</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }

  return (
    <RSModal
      open={props.open}
      title="Create Community"
      onClose={props.onClose}
      className={styles.wrapper}
      helperText={helperText}
    >
      <div style={{ marginLeft: 20, marginRight: 20 }}>
        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Community Name
        </RSText>
        <TextField
          variant="outlined"
          // value={name}
          label="Community Name"
          className={styles.textField}
          // onChange={handleNameChange}
          // error={nameErr !== ''}
          // helperText={nameErr !== '' ? nameErr : null}
        />

        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Description
        </RSText>
        <TextField
          variant="outlined"
          // value={desc}
          label="Description"
          className={styles.textField}
          multiline
          // onChange={handleDescChange}
          // error={descErr !== ''}
          // helperText={descErr !== '' ? descErr : null}
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
          <Button className={styles.createButton}>Create</Button>
        </div>
      </div>
    </RSModal>
  );
}

export default CreateCommunityModal;
