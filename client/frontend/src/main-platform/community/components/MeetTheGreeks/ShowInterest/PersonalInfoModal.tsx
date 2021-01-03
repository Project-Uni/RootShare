import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import {
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  InputLabel,
  FormControl,
  IconButton,
} from '@material-ui/core';
import { RiMessage2Line } from 'react-icons/ri';

import { BigButton, RSModal } from '../../../../reusable-components';
import RSText from '../../../../../base-components/RSText';

import { colors } from '../../../../../theme/Colors';
import { makeRequest } from '../../../../../helpers/functions';
import { SnackbarMode } from '../../../../../helpers/types';
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
    interests: string[];
  };
};

type AnswersServiceResponse = {
  answers: string[];
};

type IFormData = {
  firstName: string;
  lastName: string;
  major: string;
  graduationYear: number;
  currInterest: string;
  answer1: string;
  answer2: string;
  answer3: string;
};

const defaultFormData: IFormData = {
  firstName: 'Smitty',
  lastName: '',
  major: '',
  graduationYear: 2021,
  currInterest: '',
  answer1: '',
  answer2: '',
  answer3: '',
};

type Props = {
  open: boolean;
  communityID: string;
  handleSnackbar: (message: string, mode: SnackbarMode) => void;
  onClose: () => any;

  accessToken: string;
  refreshToken: string;
};

function PersonalInfoModal(props: Props) {
  const styles = useStyles();

  const { open, communityID, handleSnackbar, onClose } = props;

  const [interests, setInterests] = useState<string[]>([]);

  const [inputErr, setInputErr] = useState<string>();

  const [serverErr, setServerErr] = useState<string>();
  const [loading, setLoading] = useState(true);

  const {
    formFields,
    formErrors,
    handleChange,
    handleDateChange,
    updateFields,
    updateErrors,
    resetForm,
  } = useForm<IFormData>(defaultFormData);

  useEffect(() => {
    if (open) {
      fetchUserInfo();
      setInputErr(undefined);
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

      updateFields([
        { key: 'firstName', value: userInfo.firstName },
        { key: 'lastName', value: userInfo.lastName },
        { key: 'major', value: userInfo.major },
        { key: 'graduationYear', value: userInfo.graduationYear },
        { key: 'answer1', value: answers[0] },
        { key: 'answer2', value: answers[1] },
        { key: 'answer3', value: answers[2] },
      ]);

      setInterests(userInfo.interests);
      setLoading(false);
    });
  }

  const submitInfoAndInterest = async () => {
    setLoading(true);
    setServerErr(undefined);
    const userInfoPromise = makeRequest('PUT', `/api/mtg/updateUserInfo`, {
      firstName: formFields.firstName,
      lastName: formFields.lastName,
      major: formFields.major,
      graduationYear: formFields.graduationYear,
      interests,
    });

    const interestPromise = makeRequest(
      'PUT',
      `/api/mtg/updateInterestAnswers/${communityID}`,
      { answers: [formFields.answer1, formFields.answer2, formFields.answer3] }
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
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <TextField
          className={styles.inputs}
          value={formFields.lastName}
          onChange={handleChange('lastName')}
          fullWidth
          variant="outlined"
          label="Last Name"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <TextField
          className={styles.inputs}
          value={formFields.major}
          onChange={handleChange('major')}
          fullWidth
          variant="outlined"
          label="Major"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <TextField
          className={styles.inputs}
          value={formFields.graduationYear}
          onChange={handleChange('graduationYear')}
          fullWidth
          variant="outlined"
          label="Graduation Year"
          error={Boolean(inputErr)}
          helperText={inputErr}
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
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        {renderInterests()}

        <TextField
          className={styles.inputs}
          value={formFields.answer1}
          onChange={handleChange('answer1')}
          fullWidth
          variant="outlined"
          label="[Question 1]"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <TextField
          className={styles.inputs}
          value={formFields.answer2}
          onChange={handleChange('answer2')}
          fullWidth
          variant="outlined"
          label="[Question 2]"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <TextField
          className={styles.inputs}
          value={formFields.answer3}
          onChange={handleChange('answer3')}
          fullWidth
          variant="outlined"
          label="[Question 3]"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
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
        helperIcon={<RiMessage2Line size={60} />}
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
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PersonalInfoModal);
