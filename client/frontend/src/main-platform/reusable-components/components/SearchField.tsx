import React, { useState, useEffect, useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import {
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@material-ui/core';

import { debounce } from 'lodash';

import { makeRequest } from '../../../helpers/functions';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { stringify } from 'qs';

const useStyles = makeStyles((_: any) => ({
  text: {
    marginLeft: 15,
  },
  loadingIndicator: {
    color: Theme.primary,
  },
  bigFont: {
    fontSize: 24,
  },
}));

type TextFieldVariant = 'standard' | 'outlined' | 'outlined';

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
  _id: string;
  name: string;
  type: string;
  profilePicture?: string;
};

type ServiceResponse = {
  users?: User[];
  communities?: Community[];
};

type Props<T extends SearchOption> = {
  className?: string;
  fullWidth?: boolean;
  groupByType?: boolean;
  freeSolo?: boolean;
  options?: T[];
  fetchDataURL?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  onAutocomplete?: (selectedOption: T) => void;
  error?: string;
  mapData?: (users?: User[], communities?: Community[]) => T[];
  mode?: 'user' | 'community' | 'both';
  adornment?: JSX.Element;
  renderLimit?: number;
  bigText?: boolean;
  variant?: TextFieldVariant;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  initialValue?: string;
  ref?: React.MutableRefObject<HTMLDivElement | null> | null | undefined;
  style?: React.CSSProperties;
  fetchDataAdditionalParams?: { [k: string]: any };
  fetchLimit?: number;
  InputComponent?: JSX.Element; //NOTE - This has to be a material UI InputBase started component (TextField is built off input base)
};
function SearchField<T extends SearchOption = SearchOption>(props: Props<T>) {
  const styles = useStyles();

  const {
    className,
    options: optionsProps,
    fetchDataURL,
    fetchDataAdditionalParams,
    fetchLimit,
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
    fullWidth,
    groupByType,
    freeSolo,
    variant,
    bigText,
    initialValue,
    onFocus,
    onBlur,
    onChange,
    ref,
    style,
    InputComponent,
  } = props;

  const [options, setOptions] = useState(optionsProps || []);
  const [searchValue, setSearchValue] = useState(initialValue || '');

  const [loading, setLoading] = useState(false);

  const TextfieldProps = useRef({
    label: label,
    name: name,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setSearchValue(e.target.value);
      onChange?.(e);
    },
    fullWidth: fullWidth,
    onFocus: onFocus,
    onBlur: onBlur,
    helperText: Boolean(error) && error !== '' ? error : helperText,
    error: Boolean(error) && error !== '',
    placeholder: placeholder,
  });

  const onAutocomplete = (_: any, value: string | T | null) => {
    if (value) onAutocompleteProps?.(value as T);
    setSearchValue('');
  };

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
      return output;
    },
    []
  );

  const fetchData = async (query: string) => {
    if (fetchDataURL) {
      const cleanedQuery = query.replace(/\?/g, ' ').trim();
      setLoading(true);
      const params = stringify({
        query: cleanedQuery,
        limit: fetchLimit || 10,
        ...fetchDataAdditionalParams,
      });
      const { data } = await makeRequest<ServiceResponse>(
        'GET',
        `${fetchDataURL}?${params}`
      );
      if (data.success === 1) {
        const { users, communities } = data.content;
        setOptions(
          mapData?.(users as User[], communities as Community[]) ||
            defaultMapData(users, communities)
        );
      }
      setLoading(false);
    }
  };

  const debouncedFetchData = useCallback(
    debounce((query) => fetchData(query), 500),
    []
  );

  useEffect(() => {
    if (fetchDataURL && Boolean(searchValue.trim())) debouncedFetchData(searchValue);
  }, [searchValue, fetchDataURL]);

  return (
    <Autocomplete
      className={className}
      style={style}
      options={options}
      inputValue={searchValue}
      getOptionLabel={(option) => option.value}
      onChange={onAutocomplete}
      key={`autocompleted_${label}`}
      groupBy={groupByType ? (option) => option.type : undefined}
      freeSolo={freeSolo}
      fullWidth={fullWidth}
      loading={loading}
      renderInput={(params) =>
        InputComponent ? (
          React.cloneElement(InputComponent, {
            ref: params.InputProps.ref,
            inputProps: params.inputProps,
            startAdornment: adornment && (
              <InputAdornment position="start">{adornment}</InputAdornment>
            ),
            endAdornment: loading && (
              <React.Fragment>
                <CircularProgress size={20} className={styles.loadingIndicator} />
              </React.Fragment>
            ),
            ...TextfieldProps.current,
          })
        ) : (
          <TextField
            {...params}
            {...TextfieldProps.current}
            variant={variant as any}
            InputProps={{
              ...params.InputProps,
              startAdornment: adornment && (
                <InputAdornment position="start">{adornment}</InputAdornment>
              ),
              endAdornment: loading && (
                <React.Fragment>
                  <CircularProgress size={20} className={styles.loadingIndicator} />
                </React.Fragment>
              ),
              classes: { input: bigText ? styles.bigFont : undefined },
            }}
          />
        )
      }
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

SearchField.defaultProps = {
  mode: 'user',
  variant: 'outlined',
};

export default SearchField;
