import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  TextField,
  Button,
  LinearProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";
import { Redirect } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import RootShareLogoFull from "../../images/RootShareLogoFull.png";
import PurdueLogo from "../../images/purdueLogo.png";

import HypeHeader from "../headerFooter/HypeHeader";
import HypeFooter from "../headerFooter/HypeFooter";
import axios from "axios";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "35px",
  },
  card: {
    width: 450,
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
    "&:hover": {
      cursor: "pointer",
    },
  },
  rootshareLogo: {
    height: "80px",
  },
  header: {
    fontSize: "14pt",
    fontWeight: "bold",
    fontFamily: "Ubuntu",
    marginBottom: 0,
  },
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
  subheaderText: {
    fontFamily: "Ubuntu",
    textAlign: "left",
    marginLeft: "25px",
    fontSize: "11pt",
    marginTop: 10,
    color: "rgb(100,100,100)",
  },
  buttonDiv: {
    display: "flex",
    justifyContent: "flex-end",
    marginLeft: "20px",
    marginRight: "20px",
  },
  gradDegreeSelect: {
    width: 144,
    marginTop: "10px",
    marginBottom: "10px",
  },
  submitError: {
    marginLeft: 25,
    marginRight: 25,
    fontSize: "11pt",
    color: "red",
    textAlign: "left",
  },
  completeText: {
    fontSize: "13pt",
    textAlign: "left",
    margin: 0,
    fontfamily: "Ubuntu",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
  },
  finishWrapper: {
    marginTop: "20px",
  },
  logoStyle: {
    height: "100px",
    width: "100px",
  },
}));

type Props = {};

function HypeAdditionalInfo(props: Props) {
  const styles = useStyles();

  const [landingRedirect, setLandingRedirect] = useState(false);
  const [loading, setLoading] = useState(false);

  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [work, setWork] = useState("");
  const [position, setPosition] = useState("");
  const [college, setCollege] = useState("");
  const [interests, setInterests] = useState("");
  const [organizations, setOrganizations] = useState("");
  const [graduateSchool, setGraduateSchool] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasGradDegree, setHasGradDegree] = useState("No");

  const [gradYearErr, setGradYearErr] = useState("");
  const [phoneNumErr, setPhoneNumErr] = useState("");
  const [updateErr, setUpdateErr] = useState(false);

  const [regCompleted, setRegCompleted] = useState(false);

  const [currentUser, setCurrentUser] = useState("");

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

  useEffect(() => {
    let currUser = localStorage.getItem("rootshare-current-user");
    if (currUser === null) setLandingRedirect(true);
    else setCurrentUser(currUser as string);
  }, []);

  function handleMajorChange(event: any) {
    setMajor(event.target.value);
  }

  function handleGraduationYearChange(event: any) {
    setGraduationYear(event.target.value);
  }

  function handleWorkChange(event: any) {
    setWork(event.target.value);
  }

  function handlePositionChange(event: any) {
    setPosition(event.target.value);
  }

  function handleCollegeChange(event: any) {
    setCollege(event.target.value);
  }

  function handleInterestsChange(event: any) {
    setInterests(event.target.value);
  }

  function handleOrganizationsChange(event: any) {
    setOrganizations(event.target.value);
  }

  function handleHasGradDegreeChange(event: any) {
    setHasGradDegree(event.target.value);
  }

  function handleGraduateSchoolChange(event: any) {
    setGraduateSchool(event.target.value);
  }

  function handlePhoneNumberChange(event: any) {
    setPhoneNumber(event.target.value);
  }

  function handleSubmit() {
    console.log(`
      Major: ${major},
      Grad Year: ${graduationYear},
      Work: ${work},
      Position: ${position},
      College: ${college}
      Interests: ${interests},
      Organizations: ${organizations},
      Grad School: ${graduateSchool},
      Phone Number: ${phoneNumber}
    `);
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      let hasErr = false;
      if (
        graduationYear !== "" &&
        (Number(graduationYear) > 2050 || Number(graduationYear) < 1920)
      ) {
        setGradYearErr("Graduation year is invalid");
        hasErr = true;
      } else setGradYearErr("");

      if (
        phoneNumber.length !== 0 &&
        (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber))
      ) {
        setPhoneNumErr("Invalid phone number");
        hasErr = true;
      } else setPhoneNumErr("");

      if (hasErr) return;
      const { data } = await axios.post("/auth/complete-registration/details", {
        email: currentUser,
        major: major,
        graduationYear: graduationYear,
        work: work,
        position: position,
        department: college,
        organizations: organizations.split(","),
        interests: interests.split(","),
        phoneNumber: phoneNumber,
        graduateSchool: hasGradDegree ? graduateSchool : "",
      });
      if (data["success"] !== 1) {
        setUpdateErr(true);
      } else {
        setUpdateErr(false);
        setRegCompleted(true);
      }
    }, 1000);
  }

  const mode = "question";

  const modePrompts = {
    question: {
      major: "What was your major?",
      graduation: "What year did you graduate?",
      work: "Where do you currently work?",
      position: "What is your current role?",
      college:
        "Which college of Purdue did you graduate from (Krannert, Engineering, etc)?",
      interests: "What are your interests (use comma-separated list)?",
      organizations:
        "What organizations were you involved with on campus (use comma-separated list)?",
      graduateDegree: "Did you get a graduate degree?",
      graduateSchool:
        "What university did you obtain your graduate degree from?",
      phoneNumber: "Add Your Phone Number (Digits Only):",
    },
    demand: {
      major: "Major:",
      graduation: "Graduation Year:",
      work: "Current Place of Employment:",
      position: "Current Position:",
      college: "College of Study (Krannert, Engineering, etc):",
      interests: "Interests (Comma-Separated List):",
      organizatins:
        "Organizations You Were Involved With (Comma Separated List):",
      graduateDegree: "Do you have a graduate degree?",
      graduateSchool: "Graduate University:",
      phoneNumber: "Phone Number (Digits Only):",
    },
  };

  const optionalText = "This field is optional";

  return (
    <div className={styles.wrapper}>
      {landingRedirect && <Redirect to="/" />}
      <HypeHeader />
      <div className={styles.body}>
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
          <CardContent>
            <a href="/" className={styles.backArrow}>
              <FaArrowLeft color={"rgb(30, 67, 201)"} size={24} />
            </a>
            <img
              src={RootShareLogoFull}
              className={styles.rootshareLogo}
              alt="RootShare"
            />
            <p className={styles.header}>Complete your profile</p>
            {!regCompleted ? (
              <>
                <Typography className={styles.subheaderText}>
                  All of this information is completely optional, adding it will
                  help us curate the best information for you once our platform
                  goes live!
                </Typography>
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

                  <p className={styles.tabDesc}>
                    {modePrompts[mode]["graduation"]}
                  </p>
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

                  <p className={styles.tabDesc}>
                    {modePrompts[mode]["position"]}
                  </p>
                  <TextField
                    variant="outlined"
                    className={styles.textField}
                    label="Current Role"
                    helperText={optionalText}
                    value={position}
                    onChange={handlePositionChange}
                  />

                  <p className={styles.tabDesc}>
                    {modePrompts[mode]["college"]}
                  </p>
                  <FormControl variant="outlined" className={styles.textField}>
                    <InputLabel>College</InputLabel>
                    <Select
                      value={college}
                      onChange={handleCollegeChange}
                      label="College"
                    >
                      {PurdueColleges.map((singleCollege) => (
                        <MenuItem value={singleCollege}>
                          {singleCollege}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{optionalText}</FormHelperText>
                  </FormControl>
                  <p className={styles.tabDesc}>
                    {modePrompts[mode]["interests"]}
                  </p>
                  <TextField
                    variant="outlined"
                    className={styles.textField}
                    label="Interests"
                    helperText={optionalText}
                    multiline
                    value={interests}
                    onChange={handleInterestsChange}
                  />

                  <p className={styles.tabDesc}>
                    {modePrompts[mode]["organizations"]}
                  </p>
                  <TextField
                    variant="outlined"
                    className={styles.textField}
                    label="Organization"
                    helperText={optionalText}
                    multiline
                    value={organizations}
                    onChange={handleOrganizationsChange}
                  />
                  <p className={styles.tabDesc}>
                    {modePrompts[mode]["graduateDegree"]}
                  </p>
                  <FormControl
                    variant="outlined"
                    className={styles.gradDegreeSelect}
                  >
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

                  <p className={styles.tabDesc}>
                    {modePrompts[mode]["phoneNumber"]}
                  </p>
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
              </>
            ) : (
              <div className={styles.finishWrapper}>
                <Typography className={styles.completeText}>
                  <b>You are all set for the event!</b>
                </Typography>
                <Typography className={styles.completeText}>
                  We look forward to seeing you on August 15th!
                </Typography>
                <Typography className={styles.completeText}>
                  Once again, <b>Boiler Up!</b>
                </Typography>
                <img
                  src={PurdueLogo}
                  alt="Purdue Logo"
                  className={styles.logoStyle}
                />
              </div>
            )}

            {updateErr && (
              <p className={styles.submitError}>
                There was an error processing your request.
              </p>
            )}
            {!regCompleted && (
              <div className={styles.buttonDiv}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  Finish
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <HypeFooter />
    </div>
  );
}

export default HypeAdditionalInfo;
