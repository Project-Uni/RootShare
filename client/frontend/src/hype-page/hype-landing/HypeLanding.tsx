import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Typography, Button, Toolbar } from "@material-ui/core";
// import HypeBackground from "../../images/CreatedHypeBG.png";
import HypeBackground from "../../images/PurdueHypeAlt.png";
import RootShareLogo from "../../images/RootShareLogoWhite.png";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  background: {
    width: "100vw",
    backgroundImage: `url(${HypeBackground})`,
    height: `51.34vw`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100vw auto",
  },
  registerLink: {
    background: "linear-gradient(45deg, rgb(20, 29, 156), rgb(73, 106, 252))",
    borderRadius: 3,
    border: 0,
    color: "white",
    fontSize: "18pt",
    padding: "10px 60px",
    boxShadow: "0 3px 5px 2px rgba(13, 89, 255, .3)",
    // marginTop: "500px",
    marginTop: "30vw",
  },
  interior: {
    background: "radial-gradient(closest-side, rgba(0,0,0,0), rgba(0,0,0,0.1))",
    width: "100%",
    height: `51.34vw`,
  },
  headerTitle: {
    flexGrow: 1,
    textAlign: "left",
  },
  header: {
    marginBottom: "5px",
    background: "rgb(19, 52, 156)",
  },
  headerRegisterButton: {
    color: "white",
  },
  buttonLink: {
    textDecoration: "none",
  },
  headerLogo: {
    color: "white",
    height: "38px",
    width: "190px",
  },
}));

type Props = {};

function HypeLanding(props: Props) {
  const [width, setWidth] = useState(0);
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <AppBar position="static" className={styles.header}>
        <Toolbar>
          {/* <Typography className={styles.headerTitle} variant="h5">
            RootShare
          </Typography> */}
          <div className={styles.headerTitle}>
            <img
              src={RootShareLogo}
              alt="RootShare"
              className={styles.headerLogo}
            />
          </div>

          <a href="/register" className={styles.buttonLink}>
            <Button className={styles.headerRegisterButton}>Register</Button>
          </a>
        </Toolbar>
      </AppBar>
      <div className={styles.background}>
        <a href="/register" className={styles.buttonLink}>
          <Button variant="outlined" className={styles.registerLink}>
            Join Now
          </Button>
        </a>
      </div>
    </div>
  );
}

export default HypeLanding;
