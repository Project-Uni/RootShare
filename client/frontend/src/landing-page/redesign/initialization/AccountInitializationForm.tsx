import React, { useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { useForm } from '../../../helpers/hooks';
import { RSTextField } from '../../../main-platform/reusable-components';

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

const defaultFormData = {
  firstName: '',
  lastName: '',
  company: '',
  jobTitle: '',
  major: '',
  graduationYear: 2021,
  university: '',
  state: '',
};

export const AccountInitializationForm = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const { accessToken, registration } = useSelector(
    (state: RootshareReduxState) => ({
      accessToken: state.accessToken,
      registration: state.registration,
    })
  );

  const {
    formFields,
    formErrors,
    updateFields,
    updateErrors,
    handleChange,
  } = useForm(defaultFormData);

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
    else if (
      !registration?.email ||
      !registration?.password ||
      !registration?.phoneNumber
    )
      history.push('/');
    else if (!registration?.verified) history.push('/account/verify');
    else if (!registration?.accountType) history.push('/account/select');
  }, [accessToken, registration]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const ExtraFields = useCallback(() => {
    const accountType = registration?.accountType;
    switch (accountType) {
      case 'student':
        return (
          <RSTextField
            label="MAJOR"
            fullWidth
            className={styles.textfield}
            value={formFields.major}
            onChange={handleChange('major')}
            error={formErrors.major !== ''}
            helperText={formErrors.major}
          />
        );
      case 'alumni':
        return (
          <>
            <RSTextField
              label="COMPANY"
              fullWidth
              className={styles.textfield}
              value={formFields.company}
              onChange={handleChange('company')}
              error={formErrors.company !== ''}
              helperText={formErrors.company}
            />
            <RSTextField
              label="JOB TITLE"
              fullWidth
              className={styles.textfield}
              value={formFields.jobTitle}
              onChange={handleChange('jobTitle')}
              error={formErrors.jobTitle !== ''}
              helperText={formErrors.jobTitle}
            />
          </>
        );
      case 'faculty':
        return (
          <RSTextField
            label="JOB TITLE"
            fullWidth
            className={styles.textfield}
            value={formFields.jobTitle}
            onChange={handleChange('jobTitle')}
            error={formErrors.jobTitle !== ''}
            helperText={formErrors.jobTitle}
          />
        );
      case 'recruiter':
        return (
          <RSTextField
            label="COMPANY"
            fullWidth
            className={styles.textfield}
            value={formFields.company}
            onChange={handleChange('company')}
            error={formErrors.company !== ''}
            helperText={formErrors.company}
          />
        );
      default:
        return <></>;
    }
  }, [registration]);

  return (
    <div className={styles.wrapper}>
      <RSText color={Theme.bright} bold size={28} style={{ marginBottom: 20 }}>
        Tell Us About Yourself
      </RSText>
      <RSTextField
        label="FIRST NAME"
        fullWidth
        autoComplete="given-name"
        className={styles.textfield}
        value={formFields.firstName}
        onChange={handleChange('firstName')}
        error={formErrors.firstName !== ''}
        helperText={formErrors.firstName}
      />
      <RSTextField
        label="LAST NAME"
        fullWidth
        autoComplete="family-name"
        className={styles.textfield}
        value={formFields.lastName}
        onChange={handleChange('lastName')}
        error={formErrors.lastName !== ''}
        helperText={formErrors.lastName}
      />
      <ExtraFields />
    </div>
  );
};
