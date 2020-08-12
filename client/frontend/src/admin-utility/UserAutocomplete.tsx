import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

import { connect } from 'react-redux';
import { updateAccessToken, updateRefreshToken } from '../redux/actions/token';

import { makeRequest } from '../helpers/functions';

const useStyles = makeStyles((_: any) => ({}));

type Props = {
  handleAutoCompleteChange: (_: any, newValue: any) => void;
  value: String;
  err: String;
  label: string;
  accessToken: string;
  refreshToken: string;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
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
      const { data } = await makeRequest(
        'POST',
        '/api/getMatchingUsers',
        {
          query: event.target.value,
        },
        true,
        props.accessToken,
        props.refreshToken
      );
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

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateAccessToken: (accessToken: string) => {
      dispatch(updateAccessToken(accessToken));
    },
    updateRefreshToken: (refreshToken: string) => {
      dispatch(updateRefreshToken(refreshToken));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAutocomplete);
