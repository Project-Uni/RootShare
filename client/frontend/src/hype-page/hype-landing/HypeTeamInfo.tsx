import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";

import RSText from "../../base-components/RSText";

import AshwinHeadshot from "../../images/team/ashwin.jpeg";

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
  headshot: {
    width: 200,
    borderRadius: 100,
  },
  grid: {
    marginTop: 20,
  },
  jobTitle: {
    marginTop: 4,
    width: 195,
  },
  jobTitleContainer: {
    display: "flex",
    justifyContent: "center",
  },
}));

type Props = {};

function HypeTeamInfo(props: Props) {
  const styles = useStyles();

  const members = [
    {
      name: "Chris Hartley",
      title: "Chief Executive Officer",
      headshot: AshwinHeadshot,
      major: "Industrial Management, Purdue 2010",
    },
    {
      name: "Dhruv Patel",
      title: "Chief Operations Officer",
      headshot: AshwinHeadshot,
      major: "Finance, Purdue 2020",
    },
    {
      name: "Ashwin Mahesh",
      title: "Head of Product & Technology",
      headshot: AshwinHeadshot,
      major: "Computer Science, Purdue 2020",
    },
    {
      name: "Smit Desai",
      title: "Head of Architecture & Technology",
      headshot: AshwinHeadshot,
    },
    {
      name: "Jackson McCluskey",
      title: "Head of Digital Strategy",
      headshot: AshwinHeadshot,
    },
    {
      name: "Reni Patel",
      title: "Business Development Executive",
      headshot: AshwinHeadshot,
    },
    {
      name: "Caite Capezzuto",
      title: "Business Development Executive",
      headshot: AshwinHeadshot,
    },
    {
      name: "Emily D'Alessandro",
      title: "Head of Digital Marketing",
      headshot: AshwinHeadshot,
    },
    {
      name: "Lauren Odle",
      title: "Head of Social Media & Branding",
      headshot: AshwinHeadshot,
    },
  ];

  function renderMembers() {
    const output = [];
    let currMember: { [key: string]: any } = {};
    for (let i = 0; i < members.length; i++) {
      currMember = members[i];
      output.push(
        <Grid item xs={6} sm={3}>
          <img
            src={currMember["headshot"]}
            alt={`${currMember["name"]} Headshot`}
            className={styles.headshot}
          />
          <RSText type="head" size={16}>
            {currMember["name"]}
          </RSText>
          <div className={styles.jobTitleContainer}>
            <RSText type="subhead" size={14} className={styles.jobTitle} italic>
              {currMember["title"]}
            </RSText>
          </div>
          <div>
            <RSText type="subhead" size={11} italic>
              Computer Science,
            </RSText>
            <RSText type="subhead" size={11} italic>
              Purdue 2020
            </RSText>
          </div>
        </Grid>
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <Typography variant="h5" className={styles.registerText}>
        Meet the Team
      </Typography>
      <Grid container spacing={3} justify="center" className={styles.grid}>
        {renderMembers()}
      </Grid>
    </div>
  );
}

export default HypeTeamInfo;
