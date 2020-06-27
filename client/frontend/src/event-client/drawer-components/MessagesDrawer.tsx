import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function MessagesDrawer(props: Props) {
  const styles = useStyles();

  const [response, setResponse] = useState(false);

  useEffect(() => {
    const endpoint = "http://localhost:8080";
    const socket = io(endpoint);

    socket.on("FromAPI", (data: React.SetStateAction<boolean>) => {
      console.log(data);
      setResponse(data);
    });

    socket.on("error", function(err: any) {
      console.log("Received socket error:");
      console.log(err);
    });
  });

  return (
    <div className={styles.wrapper}>
      {response ? <p>The current date is: {response}</p> : <p>Loading...</p>}
    </div>
  );
}

export default MessagesDrawer;
