import React, { useState } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import { makeStyles } from '@material-ui/core/styles';
import { Button, Stepper, Step, StepLabel } from '@material-ui/core';

import RegistrationStep0 from './RegistrationStep0';
import RegistrationStep1 from './RegistrationStep1';
import RegistrationStep2 from './RegistrationStep2';
import RegistrationStep3 from './RegistrationStep3';
import HypeCard from '../hype-card/HypeCard';
import GoogleButton from './GoogleButton';
import LinkedInButton from './LinkedInButton';
import { colors } from '../../theme/Colors';

import RSText from '../../base-components/RSText';
import Theme from '../../theme/Theme';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    // display: "flex",
    // justifyContent: "center",
    // alignItems: "center",
    // height: "100vh",
  },
  buttonDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: '20px',
    marginRight: '20px',
  },
  externalDiv: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  rootshareLogo: {
    height: '80px',
  },
  alreadyHaveAnAccount: {
    marginTop: 20,
    fontFamily: 'ubuntu',
  },
  loginLink: {
    textDecoration: 'none',
    color: Theme.bright,
  },
  button: {
    background: Theme.bright,
    color: Theme.white,
    '&:hover': {
      background: Theme.brightHover,
    },
  },
}));

type Props = {
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function HypeRegistration(props: Props) {
  const styles = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [username, setUsername] = useState('');
  const [usernameErr, setUsernameErr] = useState('');

  const [university, setUniversity] = useState('Purdue University');
  const [universityErr, setUniversityErr] = useState('');

  const [firstName, setFirstName] = useState('');
  const [firstNameErr, setFirstNameErr] = useState('');
  const [lastName, setLastName] = useState('');
  const [lastNameErr, setLastNameErr] = useState('');
  const [standing, setStanding] = useState('');
  const [standingErr, setStandingErr] = useState('');

  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmErr, setConfirmErr] = useState('');
  const [ageValidation, setAgeValidation] = useState(false);
  const [ageValidationErr, setAgeValidationErr] = useState('');

  const steps = ['Email', 'Basic Info', 'Password'];

  function handleUsernameChange(event: any) {
    setUsername(event.target.value);
  }

  function handleUniversityChange(event: any) {
    setUniversity(event.target.value);
  }

  function handleUniversityAutocompleteChange(_: any, newValue: any) {
    if (newValue === null) {
      setUniversity('');
    } else setUniversity(newValue);
  }

  function handleFirstNameChange(event: React.ChangeEvent<{ value: unknown }>) {
    setFirstName(event.target.value as string);
  }

  function handleLastNameChange(event: React.ChangeEvent<{ value: unknown }>) {
    setLastName(event.target.value as string);
  }

  function handleStandingChange(event: React.ChangeEvent<{ value: unknown }>) {
    setStanding(event.target.value as string);
  }

  function handlePasswordChange(event: React.ChangeEvent<{ value: unknown }>) {
    setPassword(event.target.value as string);
  }

  function handleConfirmPasswordChange(
    event: React.ChangeEvent<{ value: unknown }>
  ) {
    setConfirmPassword(event.target.value as string);
  }

  function handleAgeValidationChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAgeValidation(event.target.checked);
  }

  function handlePreviousButtonClicked() {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
    }
  }

  function handleNextButtonClicked() {
    if (currentStep === 0) handleStep0NextButtonClick();
    else if (currentStep === 1) handleStep1NextButtonClick();
    else if (currentStep === 2) handleStep2NextButtonClick();
    else if (currentStep === 3) handleStep3NextButtonClick();
    else {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
    }
  }

  async function handleStep0NextButtonClick() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    setLoading(true);
    let hasErr = false;

    setTimeout(async () => {
      setLoading(false);
      if (!re.test(String(username).toLowerCase())) {
        setUsernameErr('Email address not valid');
        hasErr = true;
      } else setUsernameErr('');

      if (!hasErr) {
        const { data } = await axios.post('/auth/signup/user-exists', {
          email: username,
        });
        if (data['success'] !== 1) {
          setUsernameErr('An account with that email address already exists');
          hasErr = true;
        } else setUsernameErr('');
      }

      if (university.length === 0) {
        setUniversityErr('University is required');
        hasErr = true;
      } else setUniversityErr('');

      if (!hasErr) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
      }
    }, 500);
  }

  function handleStep1NextButtonClick() {
    setLoading(true);
    let hasErr = false;
    setTimeout(async () => {
      setLoading(false);

      if (firstName.length === 0) {
        setFirstNameErr('First name is required');
        hasErr = true;
      } else setFirstNameErr('');

      if (lastName.length === 0) {
        setLastNameErr('Last name is required');
        hasErr = true;
      } else setLastNameErr('');

      if (standing.length === 0) {
        setStandingErr('Standing is required');
        hasErr = true;
      } else setStandingErr('');

      if (!hasErr) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
      }
    }, 500);
  }

  function handleStep2NextButtonClick() {
    setLoading(true);
    let hasErr = false;
    setTimeout(async () => {
      setLoading(false);

      if (password.length < 8) {
        setPasswordErr('Password must be at least 8 characters');
        hasErr = true;
      } else setPasswordErr('');

      if (confirmPassword !== password) {
        setConfirmErr('Passwords must match');
        hasErr = true;
      } else setConfirmErr('');

      if (!ageValidation) {
        setAgeValidationErr('You must be over the age of 16 to register.');
        hasErr = true;
      } else setAgeValidationErr('');

      if (!hasErr) {
        const { data } = await axios.post('/auth/signup/local', {
          firstName: firstName,
          lastName: lastName,
          email: username,
          password: password,
          university: university,
          accountType: standing,
        });

        if (data['success'] !== 1) {
          setAgeValidationErr(
            'There was an error while creating the account. Please try again later.'
          );
          return;
        }

        const {
          _id,
          email,
          accessToken,
          refreshToken,
          privilegeLevel,
          accountType,
        } = data['content'];
        props.updateUser({
          firstName,
          lastName,
          _id,
          email,
          privilegeLevel,
          accountType,
        });
        props.updateAccessToken(accessToken);
        props.updateRefreshToken(refreshToken);

        const newStep = currentStep + 1;
        setCurrentStep(newStep);
      }
    }, 500);
  }

  function handleStep3NextButtonClick() {
    history.push('/register/initialize');
  }

  function getStepContent(step: Number) {
    if (step === 0)
      return (
        <RegistrationStep0
          username={username}
          handleUsernameChange={handleUsernameChange}
          usernameErr={usernameErr}
          university={university}
          handleUniversityChange={handleUniversityChange}
          handleUniversityAutocompleteChange={handleUniversityAutocompleteChange}
          universityErr={universityErr}
        />
      );
    else if (step === 1)
      return (
        <RegistrationStep1
          firstName={firstName}
          handleFirstNameChange={handleFirstNameChange}
          firstNameErr={firstNameErr}
          lastName={lastName}
          handleLastNameChange={handleLastNameChange}
          lastNameErr={lastNameErr}
          standing={standing}
          handleStandingChange={handleStandingChange}
          standingErr={standingErr}
        />
      );
    else if (step === 2)
      return (
        <RegistrationStep2
          password={password}
          handlePasswordChange={handlePasswordChange}
          passwordErr={passwordErr}
          confirmPassword={confirmPassword}
          handleConfirmPasswordChange={handleConfirmPasswordChange}
          confirmErr={confirmErr}
          ageValidation={ageValidation}
          handleAgeValidationChange={handleAgeValidationChange}
          ageValidationErr={ageValidationErr}
        />
      );
    else return <RegistrationStep3 email={username} />;
  }

  return (
    <div className={styles.wrapper}>
      <HypeCard
        width={400}
        loading={loading}
        headerText="Find your community today"
        backArrow="action"
        backArrowAction={() => {
          setCurrentStep(0);
        }}
      >
        <Stepper activeStep={currentStep}>
          {steps.map((label) => {
            const stepProps = {};
            const labelProps = {};

            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {getStepContent(currentStep)}

        <div className={styles.buttonDiv}>
          {currentStep > 0 && currentStep !== 3 ? (
            <Button
              variant="contained"
              color="inherit"
              onClick={handlePreviousButtonClicked}
              disabled={loading}
            >
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="contained"
            onClick={handleNextButtonClicked}
            disabled={loading}
            className={styles.button}
          >
            {currentStep !== steps.length - 1 ? 'Next' : 'Submit'}
          </Button>
        </div>

        {currentStep === 0 && (
          <>
            <div className={styles.externalDiv}>
              <GoogleButton messageType={'signup'} />
            </div>
            <div className={styles.externalDiv}>
              <LinkedInButton messageType={'signup'} />
            </div>
            <RSText
              type="other"
              size={12}
              color={Theme.primary}
              className={styles.alreadyHaveAnAccount}
              bold
            >
              Already have an account?{' '}
              <a className={styles.loginLink} href="/login">
                Login
              </a>
            </RSText>
          </>
        )}
      </HypeCard>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
    updateAccessToken: (accessToken: string) => {
      dispatch(updateAccessToken(accessToken));
    },
    updateRefreshToken: (refreshToken: string) => {
      dispatch(updateRefreshToken(refreshToken));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HypeRegistration);
