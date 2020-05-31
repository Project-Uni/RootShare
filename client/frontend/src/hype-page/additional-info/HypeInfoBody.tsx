import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";

const useStyles = makeStyles((_: any) => ({
  infoDiv: {
    paddingLeft: "25px",
    paddingRight: "10px",
    marginTop: "20px",
    textAlign: "left",
  },
  tabDesc: {
    fontSize: "12pt",
    margin: "0px",
    fontWeight: "bold",
    fontfamily: "Ubuntu",
    textAlign: "left",
  },
  textField: {
    width: "375px",
    marginTop: "10px",
    marginBottom: "10px",
  },
  yearField: {
    width: "150px",
    marginTop: "10px",
    marginBottom: "10px",
  },
  gradDegreeSelect: {
    width: 144,
    marginTop: "10px",
    marginBottom: "10px",
  },
}));

type Props = {
  modePrompts: any;
  mode: string;
  major: string;
  handleMajorChange: (event: any) => void;
  graduationYear: string;
  handleGraduationYearChange: (event: any) => void;
  work: string;
  handleWorkChange: (event: any) => void;
  position: string;
  handlePositionChange: (event: any) => void;
  college: string;
  handleCollegeChange: (event: any) => void;
  interests: string;
  handleInterestsChange: (event: any) => void;
  organizations: string;
  handleOrganizationsChange: (event: any) => void;
  graduateSchool: string;
  handleGraduateSchoolChange: (event: any) => void;
  phoneNumber: string;
  handlePhoneNumberChange: (event: any) => void;
  hasGradDegree: string;
  handleHasGradDegreeChange: (event: any) => void;
  gradYearErr: string;
  phoneNumErr: string;
};

function HypeInfoBody(props: Props) {
  const styles = useStyles();
  const optionalText = "This field is optional";

  const { modePrompts, mode } = props;
  const {
    major,
    handleMajorChange,
    graduationYear,
    handleGraduationYearChange,
    work,
    handleWorkChange,
    position,
    handlePositionChange,
    college,
    handleCollegeChange,
    interests,
    handleInterestsChange,
    organizations,
    handleOrganizationsChange,
    graduateSchool,
    handleGraduateSchoolChange,
    phoneNumber,
    handlePhoneNumberChange,
    hasGradDegree,
    handleHasGradDegreeChange,
    gradYearErr,
    phoneNumErr,
  } = props;

  const PurdueColleges = [
    "College of Agriculture",
    "College of Education",
    "College of Engineering",
    "Exploratory Studies",
    "College of Health and Human Sciences",
    "College of Liberal Arts",
    "Krannert School of Management",
    "College of Pharmacy",
    "Purdue Polytechnic Institute",
    "College of Science",
    "College of Veterinary Medicine",
    "Honors College",
    "The Graduate School",
  ];

  return (
    <div className={styles.infoDiv}>
      <p className={styles.tabDesc}>{modePrompts[mode]["major"]}</p>
      <TextField
        variant="outlined"
        className={styles.textField}
        label="Major"
        helperText={optionalText}
        value={major}
        onChange={handleMajorChange}
      />

      <p className={styles.tabDesc}>{modePrompts[mode]["graduation"]}</p>
      <TextField
        variant="outlined"
        className={styles.yearField}
        label="Graduation Year"
        helperText={gradYearErr === "" ? optionalText : gradYearErr}
        type="number"
        value={graduationYear}
        onChange={handleGraduationYearChange}
        error={gradYearErr !== ""}
      />

      <p className={styles.tabDesc}>{modePrompts[mode]["work"]}</p>
      <TextField
        variant="outlined"
        className={styles.textField}
        label="Current Employer"
        helperText={optionalText}
        value={work}
        onChange={handleWorkChange}
      />

      <p className={styles.tabDesc}>{modePrompts[mode]["position"]}</p>
      <TextField
        variant="outlined"
        className={styles.textField}
        label="Current Role"
        helperText={optionalText}
        value={position}
        onChange={handlePositionChange}
      />

      <p className={styles.tabDesc}>{modePrompts[mode]["college"]}</p>
      <FormControl variant="outlined" className={styles.textField}>
        <InputLabel>College</InputLabel>
        <Select value={college} onChange={handleCollegeChange} label="College">
          {PurdueColleges.map((singleCollege) => (
            <MenuItem value={singleCollege}>{singleCollege}</MenuItem>
          ))}
        </Select>
        <FormHelperText>{optionalText}</FormHelperText>
      </FormControl>
      <p className={styles.tabDesc}>{modePrompts[mode]["interests"]}</p>
      <TextField
        variant="outlined"
        className={styles.textField}
        label="Interests"
        helperText={optionalText}
        multiline
        value={interests}
        onChange={handleInterestsChange}
      />

      <p className={styles.tabDesc}>{modePrompts[mode]["organizations"]}</p>
      <TextField
        variant="outlined"
        className={styles.textField}
        label="Organization"
        helperText={optionalText}
        multiline
        value={organizations}
        onChange={handleOrganizationsChange}
      />
      <p className={styles.tabDesc}>{modePrompts[mode]["graduateDegree"]}</p>
      <FormControl variant="outlined" className={styles.gradDegreeSelect}>
        <InputLabel>Grad Degree</InputLabel>
        <Select
          value={hasGradDegree}
          onChange={handleHasGradDegreeChange}
          label="Grad Degree"
        >
          <MenuItem value="no">No</MenuItem>
          <MenuItem value="yes">Yes</MenuItem>
        </Select>
        <FormHelperText>{optionalText}</FormHelperText>
      </FormControl>

      {hasGradDegree === "yes" && (
        <>
          <p className={styles.tabDesc}>
            {modePrompts[mode]["graduateSchool"]}
          </p>
          <TextField
            variant="outlined"
            className={styles.textField}
            label="Graduate School"
            helperText={optionalText}
            multiline
            value={graduateSchool}
            onChange={handleGraduateSchoolChange}
          />
        </>
      )}

      <p className={styles.tabDesc}>{modePrompts[mode]["phoneNumber"]}</p>
      <TextField
        variant="outlined"
        className={styles.textField}
        label="Phone Number"
        helperText={phoneNumErr === "" ? optionalText : phoneNumErr}
        multiline
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        error={phoneNumErr !== ""}
      />
    </div>
  );
}

export default HypeInfoBody;
