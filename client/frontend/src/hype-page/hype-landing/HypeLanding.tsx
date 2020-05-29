import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Typography, Button, Toolbar } from "@material-ui/core";
import HypeBackground from "../../images/PurdueHypeAlt.png";
import RootShareLogoWhite from "../../images/RootShareLogoWhite.png";
import RootShareLogoFull from "../../images/RootShareLogoFull.png";
import HypeRegistration from "../hype-registration/HypeRegistration";

import { FaInstagram } from "react-icons/fa";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    minWidth: 1230,
  },
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
    // width: "100vw",
    width: Math.max(window.innerWidth, 1230),
  },
  headerRegisterButton: {
    color: "white",
  },

  headerLogo: {
    color: "white",
    height: "38px",
    width: "190px",
  },
  logoFull: {
    height: "90px",
  },
  missionStatement: {
    textAlign: "left",
    margin: 0,
    padding: 0,
    height: "auto",
    fontFamily: "Ubuntu",
    width: 700,
    marginBottom: "20px",
    fontSize: 32,
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
    fontSize: "13pt",
  },
  footer: {
    background: "#3D66DE",
    paddingTop: "20px",
    paddingBottom: "10px",
    marginTop: "50px",
    // width: "100vw",
    width: Math.max(window.innerWidth, 1230),
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

  const eventDescription = `
    RootShare is proud to present a special event on August 15th 2020,
    where speakers will talk about their experience as Purdue athletes,
    and what life has been like for them post graduation. RootShare is
    proud to present a special event on August 15th 2020, where speakers
    will talk about their experience as Purdue athletes, and what life
    has been like for them post graduation.
  `;

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

      <div className={styles.body}>
        <div className={styles.left}>
          <Typography className={styles.missionStatement} variant="h4">
            Every success story is rooted in the support from a community.
          </Typography>
          <img
            src={HypeBackground}
            className={styles.eventImage}
            alt={`Robbie Hummel, JaJuan Johnson, and E${"'"}Twaun Moore`}
          />
          <Typography className={styles.eventDate} variant="h4">
            AUGUST 15, 2020
          </Typography>
          <Typography variant="h5" className={styles.eventText}>
            {eventDescription}
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
        <a
          href="https://www.instagram.com/rootshare/"
          className={styles.instagramLink}
        >
          <FaInstagram className={styles.instagramIcon} />
        </a>
      </div>
    </div>
  );
}

export default HypeLanding;
