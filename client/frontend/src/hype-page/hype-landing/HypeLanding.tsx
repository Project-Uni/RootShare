import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar } from "@material-ui/core";
import RootShareLogoWhite from "../../images/RootShareLogoWhite.png";

import HypeDesktopBody from "./HypeDesktopBody";
import HypeMobileBody from "./HypeMobileBody";

import { FaInstagram } from "react-icons/fa";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    // minWidth: 1230,
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
    width: "100vw",
    // width: Math.max(window.innerWidth, 1230),
  },
  headerRegisterButton: {
    color: "white",
  },
  headerLogo: {
    color: "white",
    height: "38px",
    width: "190px",
  },
  footer: {
    background: "#3D66DE",
    paddingTop: "20px",
    paddingBottom: "10px",
    marginTop: "50px",
    width: "100vw",
    // width: Math.max(window.innerWidth, 1230),
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
}));

type Props = {};

function HypeLanding(props: Props) {
  const styles = useStyles();
  const [desktopMode, setDesktopMode] = useState(window.innerWidth >= 1230);

  useEffect(() => {
    window.addEventListener("resize", updateWindow);
  }, []);

  function updateWindow() {
    setDesktopMode(window.innerWidth >= 1230);
  }

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

      {desktopMode ? (
        <HypeDesktopBody eventDescription={eventDescription} />
      ) : (
        <HypeMobileBody eventDescription={eventDescription} />
      )}

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
