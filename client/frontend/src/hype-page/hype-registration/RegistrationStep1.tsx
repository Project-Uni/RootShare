import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
} from "@material-ui/core";

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
  universityStanding: {
    fontSize: "13pt",
    margin: "0px",
    fontWeight: "bold",
    fontfamily: "Ubuntu",
    textAlign: "left",
    marginLeft: "25px",
    marginTop: "10px",
  },
  textField: {
    width: "325px",
    marginTop: "20px",
    marginBottom: "10px",
  },
  statusField: {
    width: "200px",
    marginTop: "20px",
    marginBottom: "20px",
  },
  selectDiv: {
    display: "flex",
    justifyContent: "left",
    marginLeft: "25px",
  },
}));

type Props = {
  firstName: string;
  handleFirstNameChange: (event: any) => void;
  firstNameErr: string;
  lastName: string;
  handleLastNameChange: (event: any) => void;
  lastNameErr: string;
  standing: string;
  handleStandingChange: (event: any) => void;
  standingErr: string;
};

function RegistrationStep1(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <p className={styles.tabDesc}>First Name:</p>
      <TextField
        label="First Name"
        variant="outlined"
        className={styles.textField}
        value={props.firstName}
        onChange={props.handleFirstNameChange}
        error={props.firstNameErr !== ""}
        helperText={props.firstNameErr}
        autoComplete="name"
      />
      <p className={styles.tabDesc}>Last Name:</p>
      <TextField
        label="Last Name"
        variant="outlined"
        className={styles.textField}
        value={props.lastName}
        onChange={props.handleLastNameChange}
        error={props.lastNameErr !== ""}
        helperText={props.lastNameErr}
        autoComplete="family-name"
      />

      <p className={styles.universityStanding}>University Standing:</p>
      <div className={styles.selectDiv}>
        <FormControl
          variant="outlined"
          className={styles.statusField}
          error={props.standingErr !== ""}
        >
          <InputLabel id="demo-simple-select-outlined-label">
            Standing
          </InputLabel>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={props.standing}
            onChange={props.handleStandingChange}
            label="Age"
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="alumni">Alumni</MenuItem>
            <MenuItem value="faculty">Faculty</MenuItem>
            <MenuItem value="fan">Fan</MenuItem>
          </Select>
          <FormHelperText>{props.standingErr}</FormHelperText>
        </FormControl>
      </div>
    </div>
  );
}

export default RegistrationStep1;
