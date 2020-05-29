import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  TextField,
  Button,
  LinearProgress,
} from "@material-ui/core";
import { FaArrowLeft } from "react-icons/fa";

import RootShareLogoFull from "../../images/RootShareLogoFull.png";

import HypeHeader from "../headerFooter/HypeHeader";
import HypeFooter from "../headerFooter/HypeFooter";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
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
    // marginLeft: "10px",
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
    // marginLeft: "15px",
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
}));

type Props = {};

function HypeAdditionalInfo(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

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
      graduateDegree: "Did you get a graduate degree?",
      graduateSchool:
        "What university did you obtain your graduate degree from?",
      phoneNumber: "Phone Number:",
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
      phoneNumber: "Phone Number:",
    },
  };

  const optionalText = "This field is optional";

  return (
    <div className={styles.wrapper}>
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

            <div className={styles.infoDiv}>
              <p className={styles.tabDesc}>{modePrompts[mode]["major"]}</p>
              <TextField
                variant="outlined"
                className={styles.textField}
                label="Major"
                helperText={optionalText}
              />

              <p className={styles.tabDesc}>
                {modePrompts[mode]["graduation"]}
              </p>
              <TextField
                variant="outlined"
                className={styles.yearField}
                label="Graduation Year"
                helperText={optionalText}
                type="number"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <HypeFooter />
    </div>
  );
}

export default HypeAdditionalInfo;
