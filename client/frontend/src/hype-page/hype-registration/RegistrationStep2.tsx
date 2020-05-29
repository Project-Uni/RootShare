import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, FormControlLabel, Checkbox } from "@material-ui/core";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginBottom: "20px",
  },
  tabDesc: {
    fontSize: "13pt",
    margin: "0px",
    fontWeight: "bold",
    fontfamily: "Ubuntu",
    textAlign: "left",
    marginLeft: "25px",
  },
  textField: {
    width: "325px",
    marginTop: "20px",
    marginBottom: "10px",
  },
  ageValidationDiv: {
    textAlign: "left",
    marginLeft: 25,
  },
  ageErrText: {
    color: "red",
    fontFamily: "Ubuntu",
    fontStyle: "italic",
    margin: 0,
  },
}));

type Props = {
  password: string;
  handlePasswordChange: (event: any) => void;
  passwordErr: string;
  confirmPassword: string;
  handleConfirmPasswordChange: (event: any) => void;
  confirmErr: string;
  ageValidation: boolean;
  handleAgeValidationChange: (event: any) => void;
  ageValidationErr: string;
};

function RegistrationStep2(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <p className={styles.tabDesc}>Password:</p>
      <TextField
        label="Password"
        variant="outlined"
        className={styles.textField}
        type="password"
        value={props.password}
        onChange={props.handlePasswordChange}
        error={props.passwordErr !== ""}
        helperText={props.passwordErr}
        autoComplete="new-password"
      />

      <p className={styles.tabDesc}>Confirm Password:</p>
      <TextField
        label="Confirm"
        variant="outlined"
        className={styles.textField}
        type="password"
        value={props.confirmPassword}
        onChange={props.handleConfirmPasswordChange}
        error={props.confirmErr !== ""}
        helperText={props.confirmErr}
      />

      <div className={styles.ageValidationDiv}>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.ageValidation}
              onChange={props.handleAgeValidationChange}
              name="checkedB"
              color="primary"
            />
          }
          label="I confirm am over the age of 16"
        />
        {props.ageValidationErr.length > 0 && (
          <p className={styles.ageErrText}>{props.ageValidationErr}</p>
        )}
      </div>
    </div>
  );
}

export default RegistrationStep2;
