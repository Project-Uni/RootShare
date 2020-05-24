import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  TextField,
  Button,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
} from "@material-ui/core";
import { FaArrowLeft } from "react-icons/fa";

import RegistrationStep0 from "./RegistrationStep0";
import RegistrationStep1 from "./RegistrationStep1";
import RegistrationStep2 from "./RegistrationStep2";
import RegistrationStep3 from "./RegistrationStep3";
import GoogleButton from "./GoogleButton";
import LinkedInButton from "./LinkedInButton";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  card: {
    width: "450px",
  },
  cardContent: {
    paddingTop: "30px",
  },
  linearProgress: {
    backgroundColor: "rgb(30, 67, 201)",
  },
  linearProgressBg: {
    backgroundColor: "rgb(140, 165, 255)",
  },
  linearProgressRoot: {
    height: 5,
  },
  backArrow: {
    float: "left",
    marginLeft: "10px",
    verticalAlign: "center",
    marginTop: "13px",
  },
  header: {
    fontSize: "14pt",
    fontWeight: "bold",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  buttonDiv: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "20px",
    marginRight: "20px",
  },
  googleDiv: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
}));

type Props = {};

function HypeRegistration(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  //Fix
  const [currentStep, setCurrentStep] = useState(3);

  const [username, setUsername] = useState("");
  const [usernameErr, setUsernameErr] = useState("");

  const [university, setUniversity] = useState("");

  const [firstName, setFirstName] = useState("");
  const [firstNameErr, setFirstNameErr] = useState("");
  const [lastName, setLastName] = useState("");
  const [lastNameErr, setLastNameErr] = useState("");
  const [standing, setStanding] = useState("");
  const [standingErr, setStandingErr] = useState("");

  const [password, setPassword] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmErr, setConfirmErr] = useState("");


  const steps = ["Email", "Basic Info", "Password"];

  function handleUsernameChange(event: any) {
    setUsername(event.target.value);
  }

  function handleUniversityChange(event: any) {
    setUniversity(event.target.value);
  }

  function handleUniversityAutocompleteChange(_: any, newValue: any) {
    if (newValue === null) {
      setUniversity("");
    } else setUniversity(newValue);
  }

  function handleFirstNameChange(event: React.ChangeEvent<{ value: unknown }>) {
    setFirstName(event.target.value as string);
  }
  
  function handleLastNameChange(event: React.ChangeEvent<{ value: unknown }>) {
    setLastName(event.target.value as string)
  }

  function handleStandingChange(event: React.ChangeEvent<{ value: unknown }>) {
    setStanding(event.target.value as string);
  }

  function handlePasswordChange(event: React.ChangeEvent<{ value: unknown }>) {
    setPassword(event.target.value as string)
  }

  function handleConfirmPasswordChange(event: React.ChangeEvent<{ value: unknown }>) {
    setConfirmPassword(event.target.value as string)
  }

  function handlePreviousButtonClicked() {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
    }
  }

  function handleNextButtonClicked() {
    if (currentStep === 0) handleStep0NextButtonClick();
    else if(currentStep === 1) handleStep1NextButtonClick();
    else if(currentStep === 2) handleStep2NextButtonClick();
    else {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
    }
  }

  function handleStep0NextButtonClick() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      if (!re.test(String(username).toLowerCase())) {
        setUsernameErr("Email address not valid");
        return;
      }
      setUsernameErr("");

      const newStep = currentStep + 1;
      setCurrentStep(newStep);
    }, 1000);
  }

  function handleStep1NextButtonClick() {
    setLoading(true);
    let hasErr = false;
    setTimeout(async () => {
      setLoading(false);

      if (firstName.length===0) {
        setFirstNameErr('First name is required')
        hasErr = true;
      }
      else setFirstNameErr('');

      if (lastName.length===0) {
        setLastNameErr('Last name is required')
        hasErr = true;
      }
      else setLastNameErr('');

      if (standing.length===0) {
        setStandingErr('Standing is required')
        hasErr = true;
      }
      else setStandingErr('');

      if(!hasErr) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
      }
    }, 1000);
  }

  function handleStep2NextButtonClick() {
    setLoading(true);
    let hasErr = false;
    setTimeout(async () => {
      setLoading(false);
      
      if(password.length < 8) {
        setPasswordErr('Password must be atleast 8 characters')
        hasErr = true;
      }
      else setPasswordErr('')

      if(confirmPassword !== password) {
        setConfirmErr('Passwords must match')
        hasErr = true;
      }
      else setConfirmErr('')

      if(!hasErr) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
      }
    }, 1000);
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
          handleUniversityAutocompleteChange={
            handleUniversityAutocompleteChange
          }
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
        />
      );
    else return <RegistrationStep3 />;
  }

  return (
    <div className={styles.wrapper}>
      <Card raised className={styles.card}>
        <LinearProgress
          classes={{
            root: styles.linearProgressRoot,
            barColorPrimary: styles.linearProgress,
            colorPrimary: styles.linearProgressBg,
          }}
          variant={loading ? "indeterminate" : "determinate"}
          value={100}
        />
        <CardContent className={styles.cardContent}>
          <a href="/" className={styles.backArrow}>
            <FaArrowLeft color={"rgb(30, 67, 201)"} size={24} />
          </a>
          {/* Should be Logo here */}
          <p>UConnect Logo</p>
          {/* End of Logo */}
          <p className={styles.header}>Create Account</p>

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
              <Button></Button>
            )}
            {currentStep !== 3 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextButtonClicked}
                disabled={loading}
              >
                {currentStep < steps.length - 1 ? "Next" : "Submit"}
              </Button>
            ) : (
              <Button></Button>
            )}
          </div>

          {currentStep === 0 && (
            <>
              <div className={styles.googleDiv}>
                <GoogleButton />
              </div>
              <div className={styles.googleDiv}>
                <LinkedInButton />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HypeRegistration;
