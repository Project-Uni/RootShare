import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 50,
  },
  registerText: {
    fontWeight: "bold",
    fontFamily: "Ubuntu",
    marginTop: "10px",
    background: "black",
    color: "white",
    paddingTop: 8,
    paddingBottom: 8,
    width: "100%",
  },
  gold: {
    color: "rgb(217, 184, 0)",
  },
  orgName: {
    fontFamily: "Ubuntu",
    fontSize: "13pt",
    color: "rgb(100,100,100)",
    fontWeight: "bold",
  },
  grid: {
    marginTop: "15px",
  },
}));

type Props = {};

function HypeParticipatingOrganizations(props: Props) {
  const styles = useStyles();

  const organizations = ["Paint Crew", "Pi Kappa Alpha"];

  function renderOrganizations() {
    const output = [];
    for (let i = 0; i < 20; i++) {
      output.push(
        <Grid item xs={6} sm={4}>
          <Typography className={styles.orgName}>Pi Kappa Alpha</Typography>
        </Grid>
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <Typography variant="h5" className={styles.registerText}>
        Participating <span className={styles.gold}>Purdue</span> Organizations
      </Typography>
      <Grid container spacing={3} className={styles.grid}>
        {renderOrganizations()}
      </Grid>
    </div>
  );
}

export default HypeParticipatingOrganizations;
