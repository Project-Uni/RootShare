import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";

import UniversityAutocomplete from "./UniversityAutocomplete";

const useStyles = makeStyles((_: any) => ({
  tabDesc: {
    fontSize: "13pt",
    margin: "0px",
    fontWeight: "bold",
    fontfamily: "Ubuntu",
    textAlign: "left",
    marginLeft: "25px",
  },
  emailField: {
    width: "375px",
    marginTop: "10px",
    marginBottom: "10px",
  },
}));

type Props = {
  handleUsernameChange: (event: any) => void;
  username: String;
  usernameErr: String;
};

function RegistrationStep0(props: Props) {
  const styles = useStyles();

  return (
    <>
      <p className={styles.tabDesc}>Email:</p>
      <TextField
        error={props.usernameErr !== ""}
        label="Email"
        value={props.username}
        variant="outlined"
        className={styles.emailField}
        onChange={props.handleUsernameChange}
        helperText={props.usernameErr}
      />

      <p className={styles.tabDesc}>University:</p>
      <UniversityAutocomplete />
    </>
  );
}

export default RegistrationStep0;
