import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField, Grid } from '@material-ui/core';

import { PurdueIcon } from '../../images';
import { FaPlus } from 'react-icons/fa';

const useStyles = makeStyles((_: any) => ({
  logoStyle: {
    width: '30px',
    height: '30px',
  },
  schoolText: {
    fontFamily: 'Ubuntu',
    fontSize: '12pt',
    marginLeft: '20px',
  },
  plusIconDiv: {
    width: '30px',
  },
}));

type Props = {
  handleAutoCompleteChange: (_: any, newValue: any) => void;
  handleQueryChange: (event: any) => void;
  value: String;
  universityErr: String;
};

function UniversityAutocomplete(props: Props) {
  const styles = useStyles();
  const [options, setOptions] = useState([
    { school: 'Purdue University' },
    // { school: "Other" },
  ]);

  return (
    <Autocomplete
      style={{ width: 325, marginBottom: '35px' }}
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
            {option === 'Other' ? (
              <div className={styles.plusIconDiv}>
                <FaPlus size={14} color="black" />
              </div>
            ) : (
              <img src={PurdueIcon} className={styles.logoStyle} alt="Purdue P" />
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
