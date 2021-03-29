import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, TextFieldProps } from '@material-ui/core';
import Theme from '../../../theme/Theme';

const useStyles = (fontSize?: number) =>
  makeStyles((_: any) => ({
    root: {
      fontSize,
      '&$focused $notchedOutline': {
        borderColor: Theme.bright,
      },
      '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
        borderColor: Theme.brightHover,
      },
    },

    label: {
      fontSize,
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

export const RSTextField = (props: TextFieldProps & { fontSize?: number }) => {
  const { fontSize } = props;
  const styles = useStyles(fontSize)();

  const textFieldProps: TextFieldProps = Object.assign(
    {
      InputProps: {
        classes: {
          underline: props.variant !== 'outlined' ? styles.underline : undefined,
          root: styles.root,
          focused: styles.focused,
          notchedOutline:
            props.variant === 'outlined' ? styles.notchedOutline : undefined,
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
