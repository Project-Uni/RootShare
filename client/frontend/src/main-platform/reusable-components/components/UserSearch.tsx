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
  [key: string]: any;
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  profilePicture?: string;
};

type ServiceResponse = {
  users: User[];
};

type Props<T extends SearchOption> = {
  className: string;
  options?: T[];
  fetchDataURL?: string;
  name: string;
  label: string;
  helperText?: string;
  onAutocomplete?: (user: T) => void;
  error?: string;
  mapData?: (users: User[]) => T[];
};

function UserSearch<T extends SearchOption = SearchOption>(props: Props<T>) {
  const styles = useStyles();

  const {
    className,
    options: optionsProps,
    fetchDataURL,
    name,
    label,
    helperText,
    onAutocomplete: onAutocompleteProps,
    error,
    mapData,
  } = props;

  const [options, setOptions] = useState(optionsProps || []);
  const [searchValue, setSearchValue] = useState('');

  const onAutocomplete = (_: any, newValue: T | null) => {
    if (newValue) onAutocompleteProps?.(newValue);
    setSearchValue('');
  };

  const defaultMapData = useCallback(
    (users: User[]) =>
      users.map((user) => ({
        _id: user._id,
        label: `${user.firstName} ${user.lastName}`,
        value: `${user.firstName} ${user.lastName} ${user.email} ${user._id}`,
        profilePicture: user.profilePicture,
      })) as T[],
    []
  );

  const fetchData = async () => {
    if (fetchDataURL) {
      const { data } = await makeRequest<ServiceResponse>('GET', fetchDataURL);
      if (data.success === 1) {
        setOptions(
          mapData?.(data.content.users) || defaultMapData(data.content.users)
        );
      }
    }
  };

  useEffect(() => {
    if (fetchDataURL) fetchData();
  }, [searchValue, fetchDataURL]);

  return (
    <Autocomplete
      className={className}
      options={options}
      inputValue={searchValue}
      getOptionLabel={(option) => option.value}
      onChange={onAutocomplete}
      key={`autocompleted_${label}`}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          onChange={(e) => setSearchValue(e.target.value)}
          fullWidth
          helperText={Boolean(error) && error !== '' ? error : helperText}
          error={Boolean(error) && error !== ''}
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
