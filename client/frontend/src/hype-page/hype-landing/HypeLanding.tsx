import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import HypeBackground from "../../images/CreatedHypeBG.png";
import { AppBar, Typography, Button, Toolbar } from "@material-ui/core";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    // minWidth: "600px",
  },
  background: {
    width: "100vw",
    backgroundImage: `url(${HypeBackground})`,
    // height: "auto",
    height: "1600px",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100vw auto",
    // background: "radial-gradient(closest-side, white, black)",
  },
  registerLink: {
    // background: "linear-gradient(45deg, rgb(0, 85, 255), rgb(84, 167, 255))",
    background: "linear-gradient(45deg, rgb(20, 29, 156), rgb(73, 106, 252))",
    borderRadius: 3,
    border: 0,
    color: "white",
    // height: 48,
    fontSize: "18pt",
    padding: "10px 60px",
    boxShadow: "0 3px 5px 2px rgba(13, 89, 255, .3)",
    marginTop: "500px",
  },
  interior: {
    background: "radial-gradient(closest-side, rgba(0,0,0,0), rgba(0,0,0,0.1))",
    width: "100%",
    height: "700px",
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
}));

type Props = {};

function HypeLanding(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <AppBar position="static" className={styles.header}>
        <Toolbar>
          <Typography className={styles.headerTitle} variant="h5">
            RootShare
          </Typography>
          <a href="/register" className={styles.buttonLink}>
            <Button className={styles.headerRegisterButton}>Register</Button>
          </a>
        </Toolbar>
      </AppBar>
      <div className={styles.background}>
        <div className={styles.interior}>
          <a href="/register" className={styles.buttonLink}>
            <Button variant="outlined" className={styles.registerLink}>
              Join Now
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default HypeLanding;
