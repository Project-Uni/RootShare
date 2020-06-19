import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";

import axios from "axios";

import RootShareLogoFull from "../images/RootShareLogoFull.png";

import HypeHeader from "../hype-page/headerFooter/HypeHeader";
import RSText from "../base-components/RSText";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  textStyle: {
    textAlign: "center",
  },
  rootshareLogo: {
    height: "80px",
    marginLeft: 10,
    marginBottom: 20,
  },
  textField: {
    width: 300,
    marginTop: 30,
  },
}));

type Props = {};

function UserCount(props: Props) {
  const styles = useStyles();
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([
    { firstName: "", lastName: "", createdAt: "" },
  ]);
  const [joinedToday, setJoinedToday] = useState(0);
  const [searched, setSearched] = useState("");

  useEffect(() => {
    const password = prompt("Enter password:");
    if (password === "SmitMachine") {
      fetchUsers();
    } else {
      alert("Invalid password");
    }
  }, []);

  async function fetchUsers() {
    const { data } = await axios.get("/api/adminCount");
    if (data.success === 1) {
      setAllUsers(data["content"]["users"]);
      setUsers(data["content"]["users"]);
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
        console.log("Found user: ", username);
        output.push(allUsers[i]);
      }
    }
    setUsers(output);
  }

  function renderUsers() {
    const output = [];

    for (let i = 0; i < users.length; i++) {
      output.push(
        <div style={{ marginTop: 15 }}>
          <RSText type="subhead" className={styles.textStyle} size={15}>
            {users[i]["firstName"]} {users[i]["lastName"]}
          </RSText>
        </div>
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <HypeHeader />
      <img
        src={RootShareLogoFull}
        className={styles.rootshareLogo}
        alt="RootShare"
      />
      <RSText type="head" className={styles.textStyle} size={32}>
        {users.length} Users
      </RSText>
      <div style={{ marginTop: 20 }}>
        <RSText type="head" className={styles.textStyle} size={24}>
          {joinedToday} joined today
        </RSText>
      </div>
      <TextField
        variant="outlined"
        type="search"
        label="Search"
        className={styles.textField}
        value={searched}
        onChange={handleSearchChange}
      />
      <div style={{ marginTop: 30 }}>{renderUsers()}</div>
    </div>
  );
}

export default UserCount;
