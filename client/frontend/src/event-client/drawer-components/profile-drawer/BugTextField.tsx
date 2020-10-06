import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';

const useStyles = makeStyles((_: any) => ({
  // wrapper: { marginTop: 20 },
  wrapper: {},
  textField: {
    background: 'white',
    color: 'black',
    label: 'black',
  },
  input: {
    color: 'black',
    label: 'black',
  },
  cssLabel: {
    color: 'black',
    label: 'black',
  },
  cssFocused: {
    color: 'black',
    label: 'black',
    borderWidth: '2px',
    borderColor: 'black',
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: 'black',
      label: 'black',
      borderWidth: '2px',
      borderColor: 'black',
    },
  },
}));

type Props = {
  label: string;
  value: string;
  onChange: (event: any) => any;
  width?: number;
  height?: number;
  className?: string;
  type?: 'search' | 'number';
  children?: any;
  multiline?: boolean;
  error?: boolean;
  helperText?: string;
};

function BugTextField(props: Props) {
  const styles = useStyles();
  return (
    <div className={[styles.wrapper, props.className].join(' ')}>
      <TextField
        multiline={props.multiline}
        type={props.type ? props.type : 'search'}
        label={props.label}
        variant="outlined"
        className={styles.textField}
        style={{ width: props.width || 360, height: props.height }}
        onChange={props.onChange}
        value={props.value}
        error={props.error}
        helperText={props.helperText}
        InputLabelProps={{
          classes: {
            root: styles.cssLabel,
            focused: styles.cssFocused,
          },
        }}
        InputProps={{
          classes: {
            root: styles.cssOutlinedInput,
            focused: styles.cssFocused,
          },
        }}
      />
    </div>
  );
}

export default BugTextField;
