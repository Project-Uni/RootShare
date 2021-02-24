import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from '../../helpers/hooks';
import {
  RSButton,
  RSLink,
  RSTextField,
} from '../../main-platform/reusable-components';
import { Checkbox } from '@material-ui/core';
import { RSText } from '../../base-components';
import Theme from '../../theme/Theme';

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
  checkboxRoot: {
    color: Theme.bright,
    '&$checked': {
      color: Theme.bright,
    },
  },
  checked: {},
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <Checkbox classes={{ root: styles.checkboxRoot, checked: styles.checked }} />
        <RSText
          color={Theme.secondaryText}
          style={{ marginBottom: 3, marginLeft: 8 }}
        >
          By Signing up, I agree to the{' '}
          <b style={{ color: Theme.bright }}>terms and conditions</b>
        </RSText>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: 25,
        }}
      >
        <RSButton style={{ fontSize: 20, paddingLeft: 25, paddingRight: 25 }}>
          Sign Up
        </RSButton>
        <RSText color={Theme.secondaryText} size={16} style={{ marginLeft: 25 }}>
          or
        </RSText>
        <RSLink
          style={{ color: Theme.bright, marginLeft: 5 }}
          href="/login"
          underline={false}
        >
          <RSText bold size={16} color={Theme.bright}>
            Log in
          </RSText>
        </RSLink>
      </div>
    </div>
  );
};
