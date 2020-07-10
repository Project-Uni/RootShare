import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Grid, CircularProgress } from "@material-ui/core";

import axios from "axios";

import RootShareLogoFull from "../images/RootShareLogoFull.png";

import HypeHeader from "../hype-page/headerFooter/HypeHeader";
import RSText from "../base-components/RSText";
import AccountTypePieChart from "./AccountTypePieChart";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  textStyle: {
    textAlign: "center",
  },
  rootshareLogo: {
    height: "90px",
    marginLeft: 30,
    marginBottom: 10,
    marginTop: 20,
  },
  textField: {
    width: 300,
    marginTop: 30,
  },
  grid: {
    marginTop: 30,
  },
  gridItem: {
    marginTop: 15,
  },
  chart: {
    width: 300,
  },
  chartContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
  },
  loadingIndicator: {
    // color: "blue",
  },
}));

type Props = {};

function UserCount(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [showInvalid, setShowInvalid] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([
    { firstName: "", lastName: "", createdAt: "" },
  ]);
  const [joinedToday, setJoinedToday] = useState(0);
  const [typeCount, setTypeCount] = useState({
    student: 0,
    alumni: 0,
    faculty: 0,
    fan: 0,
  });
  const [searched, setSearched] = useState("");

  useEffect(() => {
    const password = prompt("Enter password:");
    if (password === "SmitMachine") {
      fetchUsers();
      setLoading(false);
    } else {
      alert("Invalid password");
      setShowInvalid(true);
      setLoading(false);
    }
  }, []);

  async function fetchUsers() {
    const { data } = await axios.get("/api/adminCount");
    if (data.success === 1) {
      setAllUsers(data["content"]["users"]);
      setUsers(data["content"]["users"]);
      setTypeCount({
        student: data["content"]["studentCount"],
        alumni: data["content"]["alumniCount"],
        faculty: data["content"]["facultyCount"],
        fan: data["content"]["fanCount"],
      });
      calculateJoinedToday(data["content"]["users"]);
    }
  }

  function calculateJoinedToday(users: [any]) {
    let newUserCount = 0;
    const currentDate = new Date();

    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const morning = new Date(year, month, day, 5, 0);

    for (let i = 0; i < users.length; i++) {
      if ("createdAt" in users[i]) {
        const difference = +new Date(users[i]["createdAt"]) - +morning;
        const hourDiff = Math.floor(difference / (1000 * 60 * 60));

        if (hourDiff > 0) {
          newUserCount += 1;
        }
      }
    }
    setJoinedToday(newUserCount);
  }

  function handleSearchChange(event: any) {
    const searchQuery = event.target.value.toLowerCase();
    setSearched(event.target.value);
    const output: any[] = [];
    for (let i = 0; i < allUsers.length; i++) {
      const username = (
        allUsers[i]["firstName"] +
        " " +
        allUsers[i]["lastName"]
      ).toLowerCase();
      if (username.includes(searchQuery)) {
        output.push(allUsers[i]);
      }
    }
    setUsers(output);
  }

  function renderUsers() {
    const output = [];

    for (let i = 0; i < users.length; i++) {
      output.push(
        <Grid item xs={6} sm={3} className={styles.gridItem}>
          <RSText type="subhead" className={styles.textStyle} size={15}>
            {i + 1}. {users[i]["firstName"]} {users[i]["lastName"]}
          </RSText>
        </Grid>
      );
    }
    return output;
  }

  function renderPageContent() {
    return (
      <>
        <RSText type="head" className={styles.textStyle} size={32}>
          {allUsers.length} Users
        </RSText>

        <div style={{ marginTop: 20 }}>
          <RSText type="head" className={styles.textStyle} size={24}>
            {joinedToday} joined today
          </RSText>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.chart}>
            <AccountTypePieChart mode="doughnut" data={typeCount} />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <RSText type="subhead" className={styles.textStyle} size={14}>
            {typeCount["student"]} Students | {typeCount["alumni"]} Alumni
          </RSText>
          <RSText type="subhead" className={styles.textStyle} size={14}>
            {typeCount["faculty"]} Faculty | {typeCount["fan"]} Fans
          </RSText>
        </div>

        <TextField
          variant="outlined"
          type="search"
          label="Find a User"
          className={styles.textField}
          value={searched}
          onChange={handleSearchChange}
        />
        <Grid container spacing={3} className={styles.grid}>
          {renderUsers()}
        </Grid>
      </>
    );
  }

  function renderInvalid() {
    return (
      <RSText type="subhead" size={32} bold>
        Permission not granted to view page
      </RSText>
    );
  }

  return (
    <div className={styles.wrapper}>
      <HypeHeader />
      <img
        src={RootShareLogoFull}
        className={styles.rootshareLogo}
        alt="RootShare"
      />
      {loading ? (
        <CircularProgress
          className={styles.loadingIndicator}
          size={100}
          color="primary"
        />
      ) : showInvalid ? (
        renderInvalid()
      ) : (
            renderPageContent()
          )}
    </div>
  );
}

export default UserCount;
