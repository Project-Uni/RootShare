import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
// import googleLogo from "../../images/google.svg";
import linkedInLogo from "../../images/linkedIn.png";

const useStyles = makeStyles((theme) => ({
  googlePaper: {
    display: "flex",
    alignItems: "center",
    width: "250px",
    height: "50px",
    backgroundColor: "rgb(14, 118, 168)",
    "&:hover": {
      backgroundColor: "rgb(12, 93, 133)",
    },
  },
  googleText: {
    display: "inline-block",
    flex: 1,
    fontFamily: "Arial",
    color: "white",
    fontWeight: "bold",
  },
  googleLink: {
    display: "flex",
    textDecoration: "none",
    width: "100%",
    height: "100%",
    "&:visited": {
      color: "inherit",
    },
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logoStyle: {
    width: "35px",
    height: "35px",
    marginLeft: "7px",
  },
}));

export default function LinkedInButton() {
  const styles = useStyles();

  return (
    <Paper className={styles.googlePaper} elevation={3}>
      <a href="/auth/login/linkedin" className={styles.googleLink}>
        <img
          src={linkedInLogo}
          alt="Google logo"
          className={styles.logoStyle}
        />

        <p className={styles.googleText}>Register With LinkedIn</p>
      </a>
    </Paper>
  );
}
