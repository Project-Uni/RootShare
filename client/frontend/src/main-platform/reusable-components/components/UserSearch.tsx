import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { Avatar, TextField, InputAdornment } from '@material-ui/core';

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
  type: 'user' | 'community';
};

type User = {
  [key: string]: any;
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  profilePicture?: string;
};

type Community = {
  [key: string]: any;
};

type ServiceResponse = {
  users?: User[];
  communities?: Community[];
};

type Props<T extends SearchOption> = {
  className?: string;
  options?: T[];
  fetchDataURL?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  onAutocomplete?: (user: T) => void;
  error?: string;
  mapData?: (users: User[]) => T[];
  mode?: 'user' | 'community' | 'both';
  adornment?: JSX.Element;
  renderLimit?: number;
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
    placeholder,
    onAutocomplete: onAutocompleteProps,
    error,
    mapData,
    mode,
    adornment,
    renderLimit,
  } = props;

  const [options, setOptions] = useState(optionsProps || []);
  const [searchValue, setSearchValue] = useState('');

  const [isFocused, setIsFocused] = useState(false);

  const onAutocomplete = (_: any, newValue: T | null) => {
    if (newValue) onAutocompleteProps?.(newValue);
    setSearchValue('');
  };

  useEffect(() => {
    console.log('options:', options);
  }, [options]);

  const defaultMapData = useCallback(
    (users: User[] | undefined, communities: Community[] | undefined) => {
      const output: T[] = [];
      if ((mode === 'community' || mode === 'both') && communities) {
        output.push(
          ...(communities
            .slice(0, renderLimit || communities.length)
            .map((community) => ({
              _id: community._id,
              profilePicture: community.profilePicture,
              label: community.name,
              value: community.name,
              type: 'community',
            })) as T[])
        );
      }
      if ((mode === 'user' || mode === 'both') && users) {
        output.push(
          ...(users
            .slice(
              0,
              renderLimit ? renderLimit - (communities?.length || 0) : users.length
            )
            .map((user) => ({
              _id: user._id,
              label: `${user.firstName} ${user.lastName}`,
              value: `${user.firstName} ${user.lastName} ${user.email} ${user._id}`,
              profilePicture: user.profilePicture,
              type: 'user',
            })) as T[])
        );
      }
      console.log('Output:', output);
      return output;
    },
    []
  );

  const fetchData = async () => {
    if (fetchDataURL) {
      const { data } = await makeRequest<ServiceResponse>(
        'GET',
        `${fetchDataURL}?query=${searchValue}&limit=10`
      );
      if (data.success === 1) {
        const { users, communities } = data.content;
        setOptions(mapData?.(users as User[]) || defaultMapData(users, communities));
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          helperText={Boolean(error) && error !== '' ? error : helperText}
          error={Boolean(error) && error !== ''}
          placeholder={placeholder}
          InputProps={{
            startAdornment: !isFocused && adornment && (
              <InputAdornment position="start">{adornment}</InputAdornment>
            ),
          }}
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

UserSearch.defaultProps = {
  mode: 'user',
};

export default UserSearch;
