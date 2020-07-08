import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

import AllConversationsContainer from "./AllConversationsContainer";
import MessageThreadContainer from "./MessageThreadContainer";

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
    // background: "white",
    overflow: "scroll",
    label: "#f2f2f2",
  },
}));

type Props = {};

function MessagesDrawerContainer(props: Props) {
  const styles = useStyles();

  const [socket, setSocket] = useState<SocketIOClient.Socket>();
  const [setup, setSetup] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currConversationID, setCurrConversationID] = useState("");
  const [currConversation, setCurrConversation] = useState({});
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (setup) return;
    setSetup(true);

    connectSocket();
    updateConversations();
  }, []);

  function connectSocket() {
    const socket = io("http://localhost:8080");
    setSocket(socket);

    socket.on("connect", (data: React.SetStateAction<boolean>) => {
      // socket.emit("metadata", conversations);
    });

    socket.on("newMessage", (data: any) => {
      console.log("NEW MESSAGE!", data);
    });

    socket.on("rerender", (data: React.SetStateAction<boolean>) => {
      // console.log("rerendering");
      // updateConversations();
      // updateMessages();
    });

    socket.on("error", function(err: any) {
      console.log(`Received socket error: ${err}`);
    });
  }

  function updateConversations() {
    axios
      .get("/api/messaging/getLatestThreads")
      .then((response) => {
        if (response.data.success !== 1) return;

        const userConversations = response.data.content.userConversations;
        if (socket !== undefined) socket.emit("metadata", userConversations);
        console.log(userConversations);
        setConversations(userConversations);
      })
      .catch((err) => {
        console.log("error", "Failed to get Conversations");
      });
  }

  function updateMessages(currID: string = currConversationID) {
    console.log(`currID: ${currID}`);

    axios
      .post("/api/messaging/getLatestMessages", {
        conversationID: currID,
      })
      .then((response) => {
        if (response.data.success !== 1) return;

        const messages = response.data.content.messages;
        setMessages(messages);
      })
      .catch((err) => {
        console.log("error", "Failed to get Messages");
      });
  }

  function selectConversation(conversation: any) {
    updateMessages(conversation._id);
    setCurrConversationID(conversation._id);
    setCurrConversation(conversation);
  }

  function returnToConversations() {
    setCurrConversationID("");
    setCurrConversation({});
    setMessages([]);
  }

  axios.get("/api/mockLogin");
  return (
    <div className={styles.wrapper}>
      <p>Messages</p>
      <div className={styles.messageContainer}>
        {currConversationID === "" ? (
          <AllConversationsContainer
            conversations={conversations}
            selectConversation={selectConversation}
          />
        ) : (
          <MessageThreadContainer
            conversationID={currConversationID}
            messages={messages}
            returnToConversations={returnToConversations}
          />
        )}
      </div>
    </div>
  );
}

export default MessagesDrawerContainer;
