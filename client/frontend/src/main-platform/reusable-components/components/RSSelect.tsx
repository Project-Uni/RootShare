import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

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
      className={[className].join('')}
      style={style}
      required={required}
      error={error}
      fullWidth={fullWidth}
    >
      <InputLabel style={{ fontSize }}>{label}</InputLabel>
      <Select value={value} onChange={onChange} style={{ fontSize }}>
        {options.map((option) => (
          <MenuItem value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
};
