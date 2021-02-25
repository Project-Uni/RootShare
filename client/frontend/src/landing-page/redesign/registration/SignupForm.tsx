import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from '../../../helpers/hooks';
import {
  RSButton,
  RSLink,
  RSTextField,
} from '../../../main-platform/reusable-components';
import { Checkbox, CircularProgress } from '@material-ui/core';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { isValidEmail } from '../../../helpers/functions';
import { useHistory } from 'react-router-dom';
import { getValidRegistration } from '../../../api';
import { useDispatch } from 'react-redux';
import { updateBasicRegistrationFields } from '../../../redux/actions';

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

type Props = {};

const defaultFormData = {
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

type IFormData = {
  [key in keyof typeof defaultFormData]: typeof defaultFormData[key];
};

export const SignupForm = (props: Props) => {
  const styles = useStyles();

  const history = useHistory();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkboxErr, setCheckboxErr] = useState(false);
  const [serverErr, setServerErr] = useState<string>();

  const { formFields, formErrors, handleChange, updateErrors } = useForm(
    defaultFormData
  );

  const handleRegister = async () => {
    if (serverErr) setServerErr('');

    let { hasErr, errUpdates } = validateForm(formFields);
    if (!checked) {
      hasErr = true;
      setCheckboxErr(true);
    }
    updateErrors(errUpdates);
    if (hasErr) return;

    setLoading(true);

    //Make API Call
    const { email, password, phoneNumber } = formFields;
    dispatch(updateBasicRegistrationFields({ email, password, phoneNumber }));
    // const data = await getValidRegistration({ email, password, phoneNumber });
    // setLoading(false);

    // if (data.success === 1) history.push('/account/verify');
    // else setServerErr(data.message);
  };

  return (
    <div className={styles.wrapper}>
      {serverErr && (
        <div style={{ flex: 1, textAlign: 'left' }}>
          <RSText color={Theme.error} size={14}>
            {serverErr}
          </RSText>
        </div>
      )}
      <RSTextField
        label="E-MAIL"
        fullWidth
        autoComplete="email"
        className={styles.textfield}
        value={formFields.email}
        onChange={handleChange('email')}
        error={formErrors.email !== ''}
        helperText={formErrors.email}
      />
      <RSTextField
        label="PHONE NUMBER"
        fullWidth
        className={styles.textfield}
        autoComplete="tel-national"
        value={formFields.phoneNumber}
        onChange={handleChange('phoneNumber')}
        error={formErrors.phoneNumber !== ''}
        helperText={formErrors.phoneNumber}
      />
      <RSTextField
        label="PASSWORD"
        type="password"
        autoComplete="new-password"
        fullWidth
        className={styles.textfield}
        value={formFields.password}
        onChange={handleChange('password')}
        error={formErrors.password !== ''}
        helperText={formErrors.password}
      />
      <RSTextField
        label="REPEAT PASSWORD"
        type="password"
        autoComplete="new-password"
        fullWidth
        className={styles.textfield}
        value={formFields.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={formErrors.confirmPassword !== ''}
        helperText={formErrors.confirmPassword}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <Checkbox
          classes={{
            root: [
              styles.checkboxRoot,
              checkboxErr ? styles.errorCheckbox : styles.standardCheckbox,
            ].join(' '),
            checked: styles.checked,
          }}
          value={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
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
        <RSButton
          style={{
            fontSize: 20,
            width: 125,
          }}
          disabled={loading}
          onClick={handleRegister}
        >
          {loading ? (
            <CircularProgress
              size={24}
              style={{ color: Theme.altText, paddingTop: 5, paddingBottom: 5 }}
            />
          ) : (
            'Sign Up'
          )}
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

const validateForm = (formFields: IFormData) => {
  let hasErr = false;
  const errUpdates: { key: keyof IFormData; value: string }[] = [];

  const { email, password, confirmPassword, phoneNumber } = formFields;
  //Email validation
  if (!isValidEmail(email)) {
    hasErr = true;
    errUpdates.push({
      key: 'email',
      value: 'Email address is not valid',
    });
  } else {
    errUpdates.push({
      key: 'email',
      value: '',
    });
  }

  //Phone Number
  if (!/^\d+$/.test(phoneNumber) || phoneNumber.length !== 10) {
    hasErr = true;
    errUpdates.push({
      key: 'phoneNumber',
      value: 'Enter a valid US phone number',
    });
  } else {
    errUpdates.push({
      key: 'phoneNumber',
      value: '',
    });
  }

  //Password
  if (password.length < 8 || password === 'password') {
    hasErr = true;
    errUpdates.push({
      key: 'password',
      value: 'The password must be more secure',
    });
  } else {
    errUpdates.push({
      key: 'password',
      value: '',
    });
  }

  //Confirm Password
  if (confirmPassword !== password) {
    hasErr = true;
    errUpdates.push({
      key: 'confirmPassword',
      value: 'The passwords do not match',
    });
  } else {
    errUpdates.push({ key: 'confirmPassword', value: '' });
  }

  return { hasErr, errUpdates };
};
