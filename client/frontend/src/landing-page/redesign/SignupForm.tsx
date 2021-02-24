import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from '../../helpers/hooks';
import { RSTextField } from '../../main-platform/reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    maxWidth: 500,
    width: '100%',
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 30,
    paddingBottom: 30,
  },
  textfield: {
    marginBottom: 30,
  },
}));

type Props = {};

export const SignupForm = (props: Props) => {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <RSTextField
        label="E-MAIL"
        fullWidth
        autoComplete="email"
        className={styles.textfield}
      />
      <RSTextField
        label="PHONE NUMBER"
        fullWidth
        className={styles.textfield}
        autoComplete="tel-national"
      />
      <RSTextField
        label="PASSWORD"
        type="password"
        autoComplete="new-password"
        fullWidth
        className={styles.textfield}
      />
      <RSTextField
        label="REPEAT PASSWORD"
        type="password"
        autoComplete="new-password"
        fullWidth
        className={styles.textfield}
      />
    </div>
  );
};
