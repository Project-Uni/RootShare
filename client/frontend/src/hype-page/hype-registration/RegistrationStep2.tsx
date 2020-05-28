import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";

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
    width: "375px",
    marginTop: "20px",
    marginBottom: "10px",
  },
}));

type Props = {
  password: string;
  handlePasswordChange: (event: any) => void;
  passwordErr: string;
  confirmPassword: string;
  handleConfirmPasswordChange: (event: any) => void;
  confirmErr: string;
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
    </div>
  );
}

export default RegistrationStep2;
