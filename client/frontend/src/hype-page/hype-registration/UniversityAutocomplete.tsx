import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Autocomplete } from "@material-ui/lab";
import { TextField, Grid } from "@material-ui/core";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  // value: String;
};

function UniversityAutocomplete(props: Props) {
  const styles = useStyles();
  const [options, setOptions] = useState([
    { school: "Purdue" },
    { school: "Other" },
  ]);
  const [value, setValue] = useState("");

  return (
    <Autocomplete
      freeSolo
      style={{ width: 375 }}
      options={options.map((option) => option.school)}
      renderInput={(params) => (
        <TextField {...params} label="University" variant="outlined" />
      )}
    />
  );
}

export default UniversityAutocomplete;
