import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  select: {
    '&:hover:not(.Mui-disabled):before': {
      borderBottomColor: Theme.brightHover,
    },
    '&:after': {
      borderBottomColor: Theme.bright,
    },
  },
  label: {
    fontSize: 18,
    '&:not($focused):not($error)': {
      color: Theme.secondaryText,
    },
    '&.Mui-focused': {
      color: Theme.bright,
    },
  },
}));

type Props = {
  options: { label: string | JSX.Element; value: string | number }[];
  className?: string;
  style?: React.CSSProperties;
  label: string;
  required?: boolean;
  helperText?: string;
  error?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<{ value: unknown }>) => void;
  fullWidth?: boolean;
  fontSize?: number;
};

export const RSSelect = (props: Props) => {
  const styles = useStyles();
  const {
    options,
    className,
    style,
    label,
    required,
    helperText,
    error,
    value,
    onChange,
    fullWidth,
    fontSize,
  } = props;

  return (
    <FormControl
      className={[className, styles.wrapper].join(' ')}
      style={style}
      required={required}
      error={error}
      fullWidth={fullWidth}
    >
      <InputLabel className={styles.label}>{label}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        style={{ fontSize }}
        className={styles.select}
      >
        {options.map((option) => (
          <MenuItem value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
};
