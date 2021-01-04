import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { Avatar, TextField } from '@material-ui/core';

import { makeRequest } from '../../../helpers/functions';
import { RSText } from '../../../base-components';

const useStyles = makeStyles((_: any) => ({
  text: {
    marginLeft: 15,
  },
}));

export type SearchOption = {
  _id: string;
  label: string;
  value: string;
  profilePicture?: string;
};

type User = {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  profilePicture?: string;
};

type Props<T extends SearchOption, K extends User> = {
  className: string;
  options?: T[];
  fetchDataURL?: string; // URL for fetching data
  name: string;
  label: string;
  helperText?: string;
  onAutocomplete?: (user: T) => void;
  error?: string;
  mapData?: (users: K[]) => T[];
};

function UserSearch<T extends SearchOption = SearchOption, K extends User = User>(
  props: Props<T, K>
) {
  const styles = useStyles();

  const [options, setOptions] = useState(props.options || []);
  const [searchValue, setSearchValue] = useState('');

  const onAutocomplete = (_: any, newValue: T | null) => {
    if (newValue) props.onAutocomplete?.(newValue);
    setSearchValue('');
  };

  const defaultMap = useCallback(
    (users: K[]): T[] =>
      users.map((user) => ({
        _id: user._id,
        label: `${user.firstName} ${user.lastName}`,
        value: `${user.firstName} ${user.lastName} ${user.email} ${user._id}`,
        profilePicture: user.profilePicture,
      })) as T[],
    []
  );

  const fetchData = async () => {
    if (props.fetchDataURL) {
      const { data } = await makeRequest<{ users: K[] }>('GET', props.fetchDataURL);
      if (data.success === 1) {
        setOptions(
          props.mapData
            ? props.mapData(data.content.users)
            : defaultMap(data.content.users)
        );
      }
    }
  };

  useEffect(() => {
    if (props.fetchDataURL) fetchData();
  }, [searchValue, props.fetchDataURL]);

  return (
    <Autocomplete
      className={props.className}
      options={options}
      inputValue={searchValue}
      getOptionLabel={(option) => option.value}
      onChange={onAutocomplete}
      key={`autocompleted_${props.label}`}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          variant="outlined"
          onChange={(e) => setSearchValue(e.target.value)}
          fullWidth
          helperText={
            Boolean(props.error) && props.error !== ''
              ? props.error
              : props.helperText
          }
          error={Boolean(props.error) && props.error !== ''}
        />
      )}
      renderOption={(option) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={option.profilePicture} alt={option.label} />
          <RSText size={13} bold className={styles.text}>
            {option.label}
          </RSText>
        </div>
      )}
    />
  );
}

export default UserSearch;
