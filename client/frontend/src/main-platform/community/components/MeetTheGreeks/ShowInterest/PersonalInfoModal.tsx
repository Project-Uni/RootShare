import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import { TextField, CircularProgress, IconButton } from '@material-ui/core';

import { BigButton, RSModal } from '../../../../reusable-components';
import RSText from '../../../../../base-components/RSText';
import ProfilePicture from '../../../../../base-components/ProfilePicture';

import { colors } from '../../../../../theme/Colors';
import { makeRequest } from '../../../../../helpers/functions';
import { SnackbarMode, UserType } from '../../../../../helpers/types';
import { useForm } from '../../../../../helpers/hooks';
import { ENTER_KEYCODE } from '../../../../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  richEditor: {
    height: 300,
    marginTop: 10,
  },
  emailHeader: {
    marginLeft: 15,
    marginRight: 15,
  },
  confirmedMessage: {
    marginTop: 15,
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 15,
  },
  inputsWrapper: {},
  inputs: {
    marginTop: 5,
    marginBottom: 5,
  },
  interestContainer: {
    paddingBottom: 10,
    marginBottom: 15,
    borderBottom: '2px solid rgba(180, 180, 180, .4)',
  },
  interestItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
}));

type UserInfoServiceResponse = {
  user: {
    firstName: string;
    lastName: string;
    major: string;
    graduationYear: number;
    phoneNumber: string;
    interests: string[];
  };
};

type AnswersServiceResponse = {
  answers: {
    [key: string]: any;
  };
};

const nonQuestionFields = [
  'firstName',
  'lastName',
  'major',
  'graduationYear',
  'phoneNumber',
  'currInterest',
];

const defaultFormData = {
  firstName: '',
  lastName: '',
  major: '',
  graduationYear: 2024,
  phoneNumber: '',
  currInterest: '',
  'Campus/Community Involvement': '',
  'High School Name': '',
  'Hometown and State': '',
  'Social Media Handle (Twitter or Instagram, please note which)': '',
  'Are you interested in a housed fraternity experience?': '',
  'Are you interested in an alcohol-free fraternity experience?': '',
  'What are you looking for in a fraternity experience?': '',
  // 'Were your relatives Greek?':'' //TODO- Update this
};

type IFormData = {
  [key in keyof typeof defaultFormData]: typeof defaultFormData[key];
};

type Props = {
  open: boolean;
  communityID: string;
  handleSnackbar: (message: string, mode: SnackbarMode) => void;
  onClose: () => any;

  user: UserType;
};

function PersonalInfoModal(props: Props) {
  const styles = useStyles();

  const { open, communityID, handleSnackbar, onClose } = props;

  const [interests, setInterests] = useState<string[]>([]);

  const [serverErr, setServerErr] = useState<string>();
  const [loading, setLoading] = useState(true);

  const {
    formFields,
    formErrors,
    handleChange,
    updateFields,
    updateErrors,
    resetForm,
  } = useForm<IFormData>(defaultFormData);

  useEffect(() => {
    if (open) {
      fetchUserInfo();
    }
  }, [open]);

  async function fetchUserInfo() {
    setLoading(true);

    const userPromise = makeRequest<UserInfoServiceResponse>(
      'GET',
      '/api/user/profile/user'
    );

    const answersPromise = makeRequest<AnswersServiceResponse>(
      'GET',
      `/api/mtg/interestAnswers/${communityID}`
    );

    Promise.all([userPromise, answersPromise]).then(([userData, answersData]) => {
      if (userData.data.success !== 1 || answersData.data.success !== 1) {
        alert('There was an error fetching User data');
        return onClose();
      }

      const userInfo = userData.data.content.user;
      const answers = answersData.data.content.answers;
      const answerKeys = Object.keys(defaultFormData).filter(
        (key) => !nonQuestionFields.includes(key)
      );
      const formattedAnswers: {
        key: keyof IFormData;
        value: any;
      }[] = Object.keys(answers)
        .filter((key) => answerKeys.includes(key))
        .map((key) => ({ key, value: answers[key] })) as any;

      updateFields([
        { key: 'firstName', value: userInfo.firstName },
        { key: 'lastName', value: userInfo.lastName },
        { key: 'major', value: userInfo.major },
        { key: 'graduationYear', value: userInfo.graduationYear },
        { key: 'phoneNumber', value: userInfo.phoneNumber },
        ...formattedAnswers,
      ]);

      setInterests(userInfo.interests);
      setLoading(false);
    });
  }

  const validateInputs = () => {
    var hasErr = false;
    const errUpdates: { key: keyof IFormData; value: string }[] = ((Object.keys(
      formFields
    ) as unknown) as (keyof IFormData)[]).map((field) => {
      if (field === 'currInterest') return { key: field, value: '' };
      if (String(formFields[field]).length === 0) {
        hasErr = true;
        return { key: field, value: `This field is required` };
      } else {
        return { key: field, value: '' };
      }
    });

    if (!props.user.profilePicture) {
      setServerErr('Please set a profile picture');
      hasErr = true;
    }
    updateErrors(errUpdates);
    return hasErr;
  };

  const submitInfoAndInterest = async () => {
    if (validateInputs()) return;
    setLoading(true);
    setServerErr(undefined);
    const userInfoPromise = makeRequest('PUT', `/api/mtg/updateUserInfo`, {
      firstName: formFields.firstName,
      lastName: formFields.lastName,
      major: formFields.major,
      graduationYear: formFields.graduationYear,
      phoneNumber: formFields.phoneNumber,
      interests,
    });

    const questionResponses = Object.keys(formFields)
      .filter((k) => !nonQuestionFields.includes(k))
      .reduce((filteredData: { [key: string]: string }, k: string) => {
        filteredData[k] = formFields[k as keyof IFormData] as string;
        return filteredData;
      }, {});

    const interestPromise = makeRequest(
      'PUT',
      `/api/mtg/interested/${communityID}`,
      { answers: JSON.stringify(questionResponses) }
    );

    Promise.all([userInfoPromise, interestPromise]).then(
      ([userInfoData, interestData]) => {
        if (userInfoData.data.success !== 1 || interestData.data.success !== 1)
          handleSnackbar('There was an error updating interest', 'error');
        else {
          handleSnackbar('Successfully submitted interest!', 'success');
          onClose();
        }

        setLoading(false);
      }
    );
  };

  const handleNewInterest = (e: any) => {
    if (e.keyCode === ENTER_KEYCODE && formFields.currInterest.length > 0) {
      e.preventDefault();
      setInterests((prevInterests) =>
        prevInterests?.concat(formFields.currInterest)
      );
      updateFields([{ key: 'currInterest', value: '' }]);
    }
  };

  const removeInterest = (idx: number) => {
    setInterests((prevInterests) => {
      let newInterests = prevInterests.slice();
      newInterests.splice(idx, 1);
      return newInterests;
    });
  };

  const renderInterests = () => {
    const interestItems: any[] = [];

    for (let i = 0; i < interests.length; i++) {
      if (interests[i] === '') continue;
      interestItems.push(
        <div className={styles.interestItem} key={i}>
          <RSText size={12} color={colors.secondaryText} italic>
            {interests[i]}
          </RSText>
          <IconButton size="small" onClick={() => removeInterest(i)}>
            X
          </IconButton>
        </div>
      );
    }

    return <div className={styles.interestContainer}>{interestItems}</div>;
  };

  const renderInputs = () => {
    return (
      <div className={styles.inputsWrapper}>
        <TextField
          className={styles.inputs}
          value={formFields.firstName}
          onChange={handleChange('firstName')}
          fullWidth
          variant="outlined"
          label="First Name"
          error={formErrors.firstName !== ''}
          helperText={formErrors.firstName}
        />
        <TextField
          className={styles.inputs}
          value={formFields.lastName}
          onChange={handleChange('lastName')}
          fullWidth
          variant="outlined"
          label="Last Name"
          error={formErrors.lastName !== ''}
          helperText={formErrors.lastName}
        />
        <TextField
          className={styles.inputs}
          value={formFields.major}
          onChange={handleChange('major')}
          fullWidth
          variant="outlined"
          label="Major"
          error={formErrors.major !== ''}
          helperText={formErrors.major}
        />
        <TextField
          className={styles.inputs}
          value={formFields.graduationYear}
          onChange={handleChange('graduationYear')}
          fullWidth
          variant="outlined"
          label="Graduation Year"
          error={formErrors.graduationYear !== ''}
          helperText={formErrors.graduationYear}
        />
        <TextField
          className={styles.inputs}
          value={formFields.phoneNumber}
          onChange={handleChange('phoneNumber')}
          fullWidth
          variant="outlined"
          label="Phone Number"
          error={formErrors.phoneNumber !== ''}
          helperText={formErrors.phoneNumber}
        />
        <TextField
          className={styles.inputs}
          value={formFields.currInterest}
          onChange={handleChange('currInterest')}
          onKeyDown={handleNewInterest}
          fullWidth
          variant="outlined"
          label="Hobbies/Interests"
          placeholder="Type New Interest and Press Enter"
          error={formErrors.currInterest !== ''}
          helperText={formErrors.currInterest}
        />
        {renderInterests()}

        {Object.keys(defaultFormData)
          .filter((key) => !nonQuestionFields.includes(key))
          .map((key) => {
            const typedKey = key as keyof IFormData;
            return (
              <TextField
                className={styles.inputs}
                value={formFields[typedKey]}
                onChange={handleChange(typedKey)}
                fullWidth
                variant="outlined"
                label={key}
                error={formErrors[typedKey] !== ''}
                helperText={formErrors[typedKey]}
              />
            );
          })}
        <BigButton
          label="Submit Info and Interest"
          onClick={submitInfoAndInterest}
        />
      </div>
    );
  };

  return (
    <>
      <RSModal
        open={open}
        title={`Update Personal Info`}
        onClose={onClose}
        className={styles.modal}
        helperText={
          'Update your personal information and answer some quick questions to help the organization get to know you better'
        }
        helperIcon={
          <ProfilePicture
            type="profile"
            height={140}
            width={140}
            borderRadius={140}
            currentPicture={props.user.profilePicture}
            editable
          />
        }
        serverErr={serverErr}
      >
        <div className={styles.contentWrapper}>
          {loading ? <CircularProgress size={60} /> : renderInputs()}
        </div>
      </RSModal>
    </>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PersonalInfoModal);
