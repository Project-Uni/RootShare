import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function MessagesDrawer(props: Props) {
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

  return (
    <div className={styles.wrapper}>
      {response ? <p>The current date is: {response}</p> : <p>Loading...</p>}
    </div>
  );
}

export default MessagesDrawer;
