import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Typography, Button, Toolbar } from "@material-ui/core";
import HypeBackground from "../../images/PurdueHypeAlt.png";
import RootShareLogoWhite from "../../images/RootShareLogoWhite.png";
import RootShareLogoFull from "../../images/RootShareLogoFull.png";
import HypeRegistration from "../hype-registration/HypeRegistration";

import { FaInstagram } from "react-icons/fa";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  buttonLink: {
    textDecoration: "none",
  },
  headerTitle: {
    flexGrow: 1,
    textAlign: "left",
  },
  header: {
    marginBottom: "5px",
    background: "#3D66DE",
    width: "100vw",
  },
  headerRegisterButton: {
    color: "white",
  },

  headerLogo: {
    color: "white",
    height: "38px",
    width: "190px",
  },
  top: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    verticalAlign: "center",
    margin: "20px 20px",
  },
  logoFull: {
    height: "90px",
  },
  missionStatement: {
    flexGrow: 1,
    textAlign: "left",
    margin: 0,
    padding: 0,
    height: "auto",
    fontFamily: "Ubuntu",
    marginLeft: "30px",
  },
  body: {
    display: "flex",
    justifyContent: "",
    marginTop: "20px",
  },
  left: {
    textAlign: "left",
    marginLeft: "20px",
    marginRight: "80px",
  },
  right: {
    flexGrow: 1,
    marginRight: 30,
  },
  eventImage: {
    width: "700px",
  },
  eventDate: {
    fontFamily: "Ubuntu",
    fontWeight: "bold",
  },
  eventText: {
    width: 700,
    fontFamily: "Ubuntu",
    marginTop: 15,
  },
  footer: {
    background: "#3D66DE",
    paddingTop: "20px",
    paddingBottom: "10px",
    marginTop: "50px",
    width: "100vw",
  },
  footerLogo: {
    height: "40px",
  },
  footerText: {
    fontFamily: "Ubuntu",
    color: "white",
  },
  instagramIcon: {
    height: 50,
    width: 50,
    color: "white",
    "&:hover": {
      color: "rgb(220,220,220)",
    },
  },
  instagramLink: {
    marginTop: "20px",
  },
  registerText: {
    fontWeight: "bold",
    fontFamily: "Ubuntu",
    marginTop: "10px",
  },
}));

type Props = {};

function HypeLanding(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <AppBar position="static" className={styles.header}>
        <Toolbar>
          <div className={styles.headerTitle}>
            <img
              src={RootShareLogoWhite}
              alt="RootShare"
              className={styles.headerLogo}
            />
          </div>
        </Toolbar>
      </AppBar>

      <div className={styles.top}>
        <img
          src={RootShareLogoFull}
          className={styles.logoFull}
          alt="RootShare"
        />
        <Typography className={styles.missionStatement} variant="h4">
          Building stronger connections among universities by connecting alumni
          and students (Replace)
        </Typography>
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          <img
            src={HypeBackground}
            className={styles.eventImage}
            alt={`Robbie Hummel, JaJuan Johnson, and E${"'"}Twaun Moore`}
          />
          <Typography className={styles.eventDate} variant="h4">
            AUGUST 15, 2020
          </Typography>
          <Typography variant="h5" className={styles.eventText}>
            RootShare is proud to present a special event on August 15th 2020,
            where speakers will talk about their experience as Purdue athletes,
            and what life has been like for them post graduation. RootShare is
            proud to present a special event on August 15th 2020, where speakers
            will talk about their experience as Purdue athletes, and what life
            has been like for them post graduation.
          </Typography>
          <Typography variant="h5" className={styles.registerText}>
            Register for the event now!
          </Typography>
        </div>
        <div className={styles.right}>
          <HypeRegistration />
        </div>
      </div>

      <div className={styles.footer}>
        <img
          src={RootShareLogoWhite}
          className={styles.footerLogo}
          alt="RootShare"
        />
        <br />
        <a href="https://www.instagram.com" className={styles.instagramLink}>
          <FaInstagram className={styles.instagramIcon} />
        </a>
      </div>
    </div>
  );
}

export default HypeLanding;
