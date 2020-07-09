import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

import AllConversationsContainer from "./AllConversationsContainer";
import MessageThreadContainer from "./MessageThreadContainer";

import { colors } from "../../../theme/Colors";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "400px",
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
  textFieldContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: colors.primary,
    borderTop: "2px solid " + colors.primaryText,
    color: colors.primaryText,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  connectionContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: colors.secondary,
    overflow: "scroll",
    label: colors.primaryText,
  },
}));

type Props = {};

function MessagesDrawerContainer(props: Props) {
  const styles = useStyles();

  const [socket, setSocket] = useState<SocketIOClient.Socket>();
  const [setup, setSetup] = useState(false);
  const [conversations, setConversations] = useState<any>([]);
  const [currConversationID, setCurrConversationID] = useState("");
  const [currConversation, setCurrConversation] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({});

  useEffect(() => {
    if (setup) return;
    setSetup(true);

    connectSocket();
  }, []);

  useEffect(() => {
    addMessage(newMessage);
  }, [newMessage]);

  function connectSocket() {
    const socket = io("http://localhost:8080");
    setSocket(socket);

    socket.on("connect", (data: React.SetStateAction<boolean>) => {
      updateConversations(socket);
    });

    socket.on("newMessage", (data: any) => {
      setNewMessage(data);
    });

    socket.on("error", function(err: any) {
      console.log(`Received socket error: ${err}`);
    });
  }

  function addMessage(newMessage: any) {
    setConversations((prevConversations: any[]) => {
      let newConversations = prevConversations;
      newConversations.forEach((conversation) => {
        if (conversation._id === newMessage.conversationID)
          conversation.lastMessage = newMessage;
      });

      return newConversations;
    });

    if (currConversationID !== "")
      setMessages((prevMessages) => prevMessages.concat(newMessage));
  }

  function updateConversations(currSocket: SocketIOClient.Socket) {
    if (currSocket === undefined && socket !== undefined) currSocket = socket;
    axios
      .get("/api/messaging/getLatestThreads")
      .then((response) => {
        if (response.data.success !== 1) return;

        const userConversations = response.data.content.userConversations;
        if (currSocket !== undefined) {
          currSocket.emit("metadata", userConversations);
        }
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
        console.log(messages);
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
  );
}

export default MessagesDrawerContainer;
