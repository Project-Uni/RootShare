import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';
import { colors } from '../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: { marginTop: 20 },
  textField: {
    // width: 360,
    background: colors.fourth,
    color: colors.primaryText,
    label: colors.primaryText,
  },
  input: {
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssLabel: {
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssFocused: {
    color: colors.primaryText,
    label: colors.primaryText,
    borderWidth: '2px',
    borderColor: colors.primaryText,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: colors.primaryText,
      label: colors.primaryText,
      borderWidth: '2px',
      borderColor: colors.primaryText,
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
};

function BugTextField(props: Props) {
  const styles = useStyles();
  return (
    <div className={[styles.wrapper, props.className].join(' ')}>
      <TextField
        multiline={!props.type}
        type={props.type ? props.type : 'search'}
        label={props.label}
        variant="outlined"
        className={styles.textField}
        style={{ width: props.width || 360, height: props.height }}
        onChange={props.onChange}
        value={props.value}
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
