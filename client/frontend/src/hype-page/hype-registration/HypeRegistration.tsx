import React, { useState, useEffect, useRef } from "react";
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
  tabDesc: {
    fontSize: "13pt",
    fontWeight: "bold",
    fontFamily: "Arial, Helvetica, sans-serif",
    textAlign: "left",
    marginLeft: "25px",
  },
  emailField: {
    width: "375px",
    marginTop: "15px",
    marginBottom: "35px",
  },
}));

type Props = {};

function HypeRegistration(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [username, setUsername] = useState("");
  const [usernameErr, setUsernameErr] = useState("");

  const steps = ["Email", "Basic Info", "Password"];

  const timer = useRef();

  function handleUsernameChange(event: any) {
    setUsername(event.target.value);
  }

  function handlePreviousButtonClicked() {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
    }
  }

  function handleNextButtonClicked() {
    if (currentStep === 0) handleStep0NextButtonClick();
    else {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
    }
  }

  function handleStep0NextButtonClick() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    setLoading(true);
    console.log(username);
    setTimeout(async () => {
      setLoading(false);
      if (!re.test(String(username).toLowerCase())) {
        setUsernameErr("Email address not valid");
        return;
      }
      const newStep = currentStep + 1;
      setCurrentStep(newStep);

      // const { data } = await axios.get(`/validateUsername/${username}`);
      // console.log("Data:", data);
      // if (data.success === 1) {
      //   changeUsernameErr("");
      //   const newStep = currentStep + 1;
      //   setCurrentStep(newStep);
      // } else {
      //   changeUsernameErr("Email already exists");
      // }
    }, 1000);
  }

  function renderStep0() {
    return (
      <>
        <p className={styles.tabDesc}>Enter your email:</p>
        <TextField
          error={usernameErr !== ""}
          label="Email"
          value={username}
          variant="outlined"
          className={styles.emailField}
          onChange={handleUsernameChange}
          helperText={usernameErr}
        />
      </>
    );
  }
  function getStepContent(step: Number) {
    if (step === 0) return renderStep0();
    else return <p>I am step {step}</p>;
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
          <p>UConnect</p>
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
            {currentStep > 0 ? (
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextButtonClicked}
              disabled={loading}
            >
              {currentStep < steps.length - 1 ? "Next" : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HypeRegistration;
