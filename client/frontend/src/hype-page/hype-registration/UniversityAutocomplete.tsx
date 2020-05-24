import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Autocomplete } from "@material-ui/lab";
import { TextField, Grid } from "@material-ui/core";

import PurdueLogo from "../../images/purdueLogo.png";
import { FaPlus } from "react-icons/fa";

const useStyles = makeStyles((_: any) => ({
  logoStyle: {
    width: "30px",
    height: "30px",
  },
  schoolText: {
    fontFamily: "Ubuntu",
    fontSize: "12pt",
    marginLeft: "20px",
  },
  plusIconDiv: {
    width: "30px",
  },
}));

type Props = {
  handleAutoCompleteChange: (_: any, newValue: any) => void;
  handleQueryChange: (event: any) => void;
  value: String;
  universityErr: String
};

function UniversityAutocomplete(props: Props) {
  const styles = useStyles();
  const [options, setOptions] = useState([
    { school: "Purdue" },
    { school: "Other" },
  ]);

  return (
    <Autocomplete
      style={{ width: 375, marginBottom: "35px" }}
      options={options.map((option) => option.school)}
      onChange={props.handleAutoCompleteChange}
      value={props.value}
      renderInput={(params) => (
        <TextField
          {...params}
          label="University"
          variant="outlined"
          fullWidth
          value={props.value}
          // onChange={props.handleQueryChange}
          error={props.universityErr !== ''}
          helperText={props.universityErr}
        />
      )}
      renderOption={(option) => (
        <Grid container alignItems="center">
          <Grid item>
            {option === "Other" ? (
              <div className={styles.plusIconDiv}>
                <FaPlus size={14} color="black" />
              </div>
            ) : (
              <img src={PurdueLogo} className={styles.logoStyle} />
            )}
          </Grid>
          <Grid item xs>
            <p className={styles.schoolText}>{option}</p>
          </Grid>
        </Grid>
      )}
    />
  );
}

export default UniversityAutocomplete;
