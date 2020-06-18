import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import axios from "axios";

import RSText from "../base-components/RSText";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  textStyle: {
    textAlign: "center",
  },
}));

type Props = {};

function UserCount(props: Props) {
  const styles = useStyles();
  const [users, setUsers] = useState([]);

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
      setUsers(data["content"]["users"]);
    }
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
      <RSText type="head" className={styles.textStyle} size={32}>
        {users.length}
      </RSText>
      <div style={{ marginTop: 30 }}>{renderUsers()}</div>
    </div>
  );
}

export default UserCount;
