import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight - 60,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: "white",
    overflow: "scroll",
    label: "#f2f2f2",
  },
}));

type Props = {};

function MessagesDrawerContainer(props: Props) {
  const styles = useStyles();

  const [response, setResponse] = useState(false);
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    if (setup) return;
    setSetup(true);

    connectSocket();
  }, []);

  function connectSocket() {
    const endpoint = "http://localhost:8080";
    const socket = io(endpoint);

    socket.on("connect", (data: React.SetStateAction<boolean>) => {
      // socket.emit("metadata", sendPacket()); // TODO: get data on conversation
    });

    socket.on("rerender", (data: React.SetStateAction<boolean>) => {
      console.log("rerendering messages");
    });

    socket.on("error", function(err: any) {
      console.log(`Received socket error: ${err}`);
    });
  }

  function renderLatestMesasages() {
    return <div></div>;
  }

  return (
    <div className={styles.wrapper}>
      <p>HELLO</p>
      <div className={styles.messageContainer}>{renderLatestMesasages()}</div>
    </div>
  );
}

export default MessagesDrawerContainer;
