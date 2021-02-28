import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { useForm } from '../../../helpers/hooks';
import {
  RSButton,
  RSSelect,
  RSTextField,
} from '../../../main-platform/reusable-components';
import { CircularProgress } from '@material-ui/core';
import { postRegisterUser } from '../../../api/post';
import {
  updateRefreshToken,
  updateAccessToken,
  updateUser,
  dispatchSnackbar,
  resetRegistration,
} from '../../../redux/actions';
import { States } from '../../../helpers/constants';
import { AccountType } from '../../../helpers/types';

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
  graduationYear: new Date().getFullYear(),
  university: '',
  state: '',
};
type IFormData = {
  [key in keyof typeof defaultFormData]: typeof defaultFormData[key];
};

export const AccountInitializationForm = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();

  const dispatch = useDispatch();
  const { accessToken, registration } = useSelector(
    (state: RootshareReduxState) => ({
      accessToken: state.accessToken,
      registration: state.registration,
    })
  );

  const [loading, setLoading] = useState(false);

  const { formFields, formErrors, updateErrors, handleChange } = useForm(
    defaultFormData
  );

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
    else if (
      !registration?.email ||
      !registration?.password ||
      !registration?.phoneNumber ||
      !registration?.initializationVector
    )
      history.push('/');
    else if (!registration?.verified) history.push('/account/verify');
    else if (!registration?.accountType) history.push('/account/select');
  }, [accessToken, registration]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async () => {
    setLoading(true);
    const { hasErr, errUpdates } = validateForm(
      formFields,
      registration?.accountType
    );
    updateErrors(errUpdates);

    if (hasErr) {
      setLoading(false);
      return;
    }

    const {
      email,
      phoneNumber,
      accountType,
      password,
      initializationVector,
    } = registration!;
    const data = await postRegisterUser({
      ...formFields,
      email: email!,
      phoneNumber: phoneNumber!,
      accountType: accountType!,
      password: password!,
      initializationVector: initializationVector!,
    });
    setLoading(false);
    if (data.success === 1) {
      const {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = data['content'];
      dispatch(resetRegistration());
      dispatch(
        updateUser({
          ...user,
        })
      );
      dispatch(updateAccessToken(newAccessToken));
      dispatch(updateRefreshToken(newRefreshToken));
      history.push('/home');
    } else {
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error while attempting to create the account',
        })
      );
    }
  };

  const renderExtraFields = () => {
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
  };

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
      {renderExtraFields()}
      <RSTextField
        label="GRADUATION YEAR"
        fullWidth
        className={styles.textfield}
        value={formFields.graduationYear}
        onChange={handleChange('graduationYear')}
        error={formErrors.graduationYear !== ''}
        helperText={formErrors.graduationYear}
        type="number"
      />
      <RSSelect
        label="UNIVERSITY"
        options={[{ label: 'Purdue University', value: '5eb89c308cc6636630c1311f' }]}
        fullWidth
        value={formFields.university}
        onChange={handleChange('university')}
        className={styles.textfield}
        style={{ textAlign: 'left' }}
        fontSize={18}
        error={Boolean(formErrors.university)}
        helperText={formErrors.university}
      />
      <RSSelect
        label="STATE"
        options={States.map((state) => ({
          label: state.state,
          value: state.code,
        }))}
        fullWidth
        value={formFields.state}
        onChange={handleChange('state')}
        className={styles.textfield}
        style={{ textAlign: 'left' }}
        fontSize={18}
        error={Boolean(formErrors.state)}
        helperText={formErrors.state}
      />

      <RSButton
        style={{
          fontSize: 18,
          width: 125,
        }}
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <CircularProgress
            size={24}
            style={{ color: Theme.altText, paddingTop: 5, paddingBottom: 5 }}
          />
        ) : (
          'Finish'
        )}
      </RSButton>
    </div>
  );
};

const validateForm = (
  formFields: IFormData,
  accountType: AccountType | undefined
) => {
  let hasErr = false;
  const errUpdates: { key: keyof IFormData; value: string }[] = [];

  const {
    firstName,
    lastName,
    graduationYear,
    university,
    state,
    major,
    jobTitle,
    company,
  } = formFields;

  if (!firstName) {
    hasErr = true;
    errUpdates.push({
      key: 'firstName',
      value: 'Enter a valid first name',
    });
  } else {
    errUpdates.push({
      key: 'firstName',
      value: '',
    });
  }

  if (!lastName) {
    hasErr = true;
    errUpdates.push({
      key: 'lastName',
      value: 'Enter a valid last name',
    });
  } else {
    errUpdates.push({
      key: 'lastName',
      value: '',
    });
  }

  if (
    !graduationYear ||
    graduationYear < 1930 ||
    graduationYear > new Date().getFullYear() + 5
  ) {
    hasErr = true;
    errUpdates.push({
      key: 'graduationYear',
      value: 'Enter a valid graduation year',
    });
  } else {
    errUpdates.push({
      key: 'graduationYear',
      value: '',
    });
  }

  if (!university) {
    hasErr = true;
    errUpdates.push({
      key: 'university',
      value: 'Select a university',
    });
  } else {
    errUpdates.push({
      key: 'university',
      value: '',
    });
  }

  if (!state) {
    hasErr = true;
    errUpdates.push({
      key: 'state',
      value: 'Enter your current state of residence',
    });
  } else {
    errUpdates.push({
      key: 'state',
      value: '',
    });
  }

  if (accountType === 'student' && !major) {
    hasErr = true;
    errUpdates.push({
      key: 'major',
      value: 'Enter a valid major',
    });
  } else {
    errUpdates.push({
      key: 'major',
      value: '',
    });
  }

  if ((accountType === 'alumni' || accountType === 'recruiter') && !company) {
    hasErr = true;
    errUpdates.push({
      key: 'company',
      value: 'Enter a valid company',
    });
  } else {
    errUpdates.push({
      key: 'company',
      value: '',
    });
  }

  if ((accountType === 'alumni' || accountType === 'faculty') && !jobTitle) {
    hasErr = true;
    errUpdates.push({
      key: 'jobTitle',
      value: 'Enter a valid job title',
    });
  } else {
    errUpdates.push({
      key: 'jobTitle',
      value: '',
    });
  }
  return { hasErr, errUpdates };
};
