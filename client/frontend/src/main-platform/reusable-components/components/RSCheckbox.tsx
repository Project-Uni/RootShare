import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Checkbox, CheckboxProps } from '@material-ui/core';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  checkboxRoot: {
    '&$checked': {
      color: Theme.bright,
    },
  },
  standardCheckbox: {
    color: Theme.bright,
  },
  errorCheckbox: {
    color: Theme.error,
  },
  checked: {},
}));

export const RSCheckbox = (props: CheckboxProps & { error?: boolean }) => {
  const styles = useStyles();
  const { error, ...checkboxProps } = props;

  return (
    <Checkbox
      classes={{
        root: [
          styles.checkboxRoot,
          error ? styles.errorCheckbox : styles.standardCheckbox,
        ].join(' '),
        checked: styles.checked,
      }}
      {...checkboxProps}
    />
  );
};
