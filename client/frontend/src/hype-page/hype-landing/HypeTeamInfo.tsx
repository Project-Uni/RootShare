import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";

import RSText from "../../base-components/RSText";

import {
  AshwinHeadshot,
  SmitHeadshot,
  CaiteHeadshot,
  ChrisHeadshot,
  DhruvHeadshot,
  LaurenHeadshot,
  // EmilyHeadshot,
  ReniHeadshot,
  JacksonHeadshot,
  WillHeadshot
} from "../../images/team";

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
      headshot: ChrisHeadshot,
      major: "Industrial Management",
      university: "Purdue 2006",
    },
    {
      name: "Dhruv Patel",
      title: "Chief Operating Officer",
      headshot: DhruvHeadshot,
      major: "Finance",
      university: "Purdue 2020",
    },
    {
      name: "Ashwin Mahesh",
      title: "Head of Product & Technology",
      headshot: AshwinHeadshot,
      major: "Computer Science",
      university: "Purdue 2020",
    },
    {
      name: "Smit Desai",
      title: "Head of Architecture & Technology",
      headshot: SmitHeadshot,
      major: "Computer Science",
      university: "Illinois 2020",
    },
    {
      name: "Jackson McCluskey",
      title: "Head of Digital Strategy",
      headshot: JacksonHeadshot,
      major: "Computer Science",
      university: "Purdue 2021",
    },
    {
      name: "Reni Patel",
      title: "Head of Alumni Engagements",
      headshot: ReniHeadshot,
      major: "Aerospace Engineering",
      university: "Purdue 2020",
    },
    {
      name: "Caite Capezzuto",
      title: "Head of Student Engagements",
      headshot: CaiteHeadshot,
      major: "Construction Management & Technology",
      university: "Purdue 2022",
    },
    {
      name: 'William Feeks', 
      title:'Head of Business Engagement', 
      headshot: WillHeadshot,
      major:'Management & Marketing', 
      university:'Purdue 2021'
    },
    // {
    //   name: "Emily D'Alessandro",
    //   title: "Head of Digital Marketing",
    //   headshot: EmilyHeadshot,
    //   major: "Marketing",
    //   university: "Purdue 2021",
    // },
    {
      name: "Lauren Odle",
      title: "Head of Marketing",
      headshot: LaurenHeadshot,
      major: "Marketing",
      university: "Purdue 2020",
    },
  ];

  function renderMembers() {
    const output = [];
    let currMember: { [key: string]: any } = {};
    for (let i = 0; i < members.length; i++) {
      currMember = members[i];
      output.push(
        <Grid item xs={6} sm={4} md={3} lg={2}>
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
              {currMember["major"]},
            </RSText>
            <RSText type="subhead" size={11} italic>
              {currMember["university"]}
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
