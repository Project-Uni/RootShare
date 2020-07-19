import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

import axios from 'axios';

const useStyles = makeStyles((_: any) => ({
  logoStyle: {
    width: '30px',
    height: '30px',
  },
  schoolText: {
    fontFamily: 'Ubuntu',
    fontSize: '12pt',
    marginLeft: '20px',
  },
  plusIconDiv: {
    width: '30px',
  },
}));

type Props = {
  handleAutoCompleteChange: (_: any, newValue: any) => void;
  value: String;
  err: String;
  label: string;
};

type UserInfo = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

function UserAutocomplete(props: Props) {
  const styles = useStyles();
  const [options, setOptions] = useState<UserInfo[]>([]);

  async function handleQueryChange(event: any) {
    if (event.target.value.length >= 3) {
      const { data } = await axios.post('/api/getMatchingUsers', {
        query: event.target.value,
      });
      if (data['success'] === 1) {
        setOptions(data['content']['users']);
      }
    }
  }

  return (
    <Autocomplete
      style={{ width: 400, marginBottom: '20px' }}
      options={options}
      getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
      onChange={props.handleAutoCompleteChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          variant="outlined"
          fullWidth
          value={props.value}
          error={props.err !== ''}
          helperText={props.err}
          onChange={handleQueryChange}
        />
      )}
    />
  );
}

export default UserAutocomplete;
