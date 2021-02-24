import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, TextFieldProps } from '@material-ui/core';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  root: {
    fontSize: 18,
    '&$focused $notchedOutline': {
      borderColor: Theme.bright,
    },
    '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
      borderColor: Theme.brightHover,
    },
  },

  label: {
    fontSize: 18,
    paddingLeft: 5,
    paddingRight: 5,
    '&:not($focused):not($error)': {
      color: Theme.secondaryText,
    },
    '&$focused': {
      color: Theme.bright,
    },
  },
  focused: {},
  notchedOutline: {},
  underline: {
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottomColor: Theme.brightHover,
    },
    '&:after': {
      borderBottomColor: Theme.bright,
    },
  },
}));

export const RSTextField = (props: TextFieldProps) => {
  const styles = useStyles();

  const textFieldProps: TextFieldProps = Object.assign(
    {
      InputProps: {
        classes: {
          underline: styles.underline,
          root: styles.root,
          focused: styles.focused,
          notchedOutline: styles.notchedOutline,
        },
      },
      InputLabelProps: {
        classes: {
          root: styles.label,
          focused: styles.focused,
        },
      },
    },
    props
  );

  return <TextField {...textFieldProps} />;
};
