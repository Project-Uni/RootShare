import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type SearchOption = {
  label: string;
  value: string;
  profilePicture?: string;
};

type ServiceResponse = {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  profilePicture?: string;
}[];

type Props = {
  className: string;
  options?: SearchOption[];
  fetchDataURL?: string; // URL for fetching data
  name: string;
  label: string;
  helperText?: string;
};

function UserSearch(props: Props) {
  const styles = useStyles();

  const [options, setOptions] = useState(props.options || []);
  const [searchValue, setSearchValue] = useState('');

  const fetchData = async () => {
    if (props.fetchDataURL) {
      const { data } = await makeRequest<ServiceResponse>('GET', props.fetchDataURL);
      if (data.success === 1) {
        setOptions(
          data.content.map((user) => ({
            label: `${user.firstName} ${user.lastName}`,
            value: `${user.firstName} ${user.lastName} ${user.email} ${user._id}`,
            profilePicture: user.profilePicture,
          }))
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
      getOptionLabel={(option) => option.label}
      onChange={() => {}}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          variant="outlined"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          fullWidth
        />
      )}
      renderOption={(option) => <div>{option.label}</div>}
    />
  );
}

export default UserSearch;
