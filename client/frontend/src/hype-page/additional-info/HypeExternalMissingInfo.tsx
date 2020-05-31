import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
  Button,
} from "@material-ui/core";

import axios from "axios";
import { Redirect } from "react-router-dom";

import HypeHeader from "../headerFooter/HypeHeader";
import HypeFooter from "../headerFooter/HypeFooter";
import HypeCard from "../hype-card/HypeCard";
import UniversityAutocomplete from "../hype-registration/UniversityAutocomplete";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  tabDesc: {
    fontSize: "13pt",
    margin: "0px",
    fontWeight: "bold",
    fontfamily: "Ubuntu",
    textAlign: "left",
    marginLeft: "25px",
    marginTop: "20px",
  },
  autocompleteDiv: {
    marginLeft: "25px",
    marginTop: "20px",
  },
  universityStanding: {
    fontSize: "13pt",
    margin: "0px",
    fontWeight: "bold",
    fontfamily: "Ubuntu",
    textAlign: "left",
    marginLeft: "25px",
    marginTop: -15,
  },
  selectDiv: {
    display: "flex",
    justifyContent: "left",
    marginLeft: "25px",
  },
  statusField: {
    width: "200px",
    marginTop: "20px",
    marginBottom: "20px",
  },
  buttonDiv: {
    display: "flex",
    justifyContent: "flex-end",
    marginLeft: "20px",
    marginRight: "20px",
  },
}));

type Props = {};

function HypeExternalMissingInfo(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [landingRedirect, setLandingRedirect] = useState(false);

  const [university, setUniversity] = useState("Purdue");
  const [standing, setStanding] = useState("");
  const [universityErr, setUniversityErr] = useState("");
  const [standingErr, setStandingErr] = useState("");

  async function getCurrentUser() {
    const { data } = await axios.get("/user/getCurrent");
    if (data["success"] === 1)
      localStorage.setItem("rootshare-current-user", data["content"]["email"]);
    else setLandingRedirect(true);
  }

  useEffect(() => {
    getCurrentUser();
  }, []);

  function handleUniversityChange(event: any) {
    setUniversity(event.target.value);
  }

  function handleUniversityAutocompleteChange(_: any, newValue: any) {
    if (newValue === null) {
      setUniversity("");
    } else setUniversity(newValue);
  }

  function handleStandingChange(event: any) {
    setStanding(event.target.value);
  }

  function handleSubmit() {
    setLoading(true);
    let hasErr = false;
    setTimeout(async () => {
      setLoading(false);
      if (standing.length === 0) {
        setStandingErr("Standing is required");
        hasErr = true;
      } else setStandingErr("");

      if (university.length === 0) {
        setUniversityErr("University is required");
        hasErr = true;
      } else setUniversityErr("");

      if (hasErr) return;

      const { data } = await axios.post(
        "/auth/complete-registration/required",
        {
          university: university,
          accountType: standing,
        }
      );
      if (data.success === 1) {
        window.location.href = "/profile/initialize";
      }
    }, 1000);
  }

  function renderUniversityStandingSelect() {
    return (
      <>
        <p className={styles.universityStanding}>University Standing:</p>
        <div className={styles.selectDiv}>
          <FormControl
            variant="outlined"
            className={styles.statusField}
            error={standingErr !== ""}
          >
            <InputLabel>Standing</InputLabel>
            <Select
              value={standing}
              onChange={handleStandingChange}
              label="Age"
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="alumni">Alumni</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
              <MenuItem value="fan">Fan</MenuItem>
            </Select>
            <FormHelperText>{standingErr}</FormHelperText>
          </FormControl>
        </div>
      </>
    );
  }

  return (
    <div className={styles.wrapper}>
      {landingRedirect && <Redirect to="/" />}
      <HypeHeader />
      <div className={styles.body}>
        <HypeCard
          headerText="We need some more info"
          backArrow="link"
          backArrowLink="/"
          width={400}
          loading={loading}
        >
          <p className={styles.tabDesc}>University:</p>
          <div className={styles.autocompleteDiv}>
            <UniversityAutocomplete
              value={university}
              handleQueryChange={handleUniversityChange}
              handleAutoCompleteChange={handleUniversityAutocompleteChange}
              universityErr={universityErr}
            />
          </div>
          {renderUniversityStandingSelect()}
          <div className={styles.buttonDiv}>
            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={handleSubmit}
            >
              Next
            </Button>
          </div>
        </HypeCard>
      </div>
      <HypeFooter />
    </div>
  );
}

export default HypeExternalMissingInfo;
