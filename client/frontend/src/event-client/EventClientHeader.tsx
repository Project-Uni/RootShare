import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, IconButton, colors } from "@material-ui/core";
import RootShareLogoWhite from "../images/RootShareLogoWhite.png";

import { MdGroupAdd, MdAccountCircle } from "react-icons/md";
import { IoMdText } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";

import EventDrawer from "./EventDrawer";

import ConnectionsDrawerContainer from "./drawer-components/ConnectionsDrawerContainer"

import {
  CalendarDrawer,
  MessagesDrawer,
  ProfileDrawer,
} from "./drawer-components";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flexGrow: 1,
  },
  header: {
    background: "#242D56",
  },
  headerLogo: {
    height: "38px",
    width: "190px",
  },
  icons: {},
  iconStyle: {},
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
  },
}));

type Props = {};

function EventClientHeader(props: Props) {
  const styles = useStyles();
  const [drawerContent, setDrawerContent] = useState("");

  function handleDrawerClose() {
    setDrawerContent("");
  }

  function handleConnectionsClick() {
    setDrawerContent("connections");
  }

  function handleMessagesClick() {
    setDrawerContent("messages");
  }

  function handleCalendarClick() {
    setDrawerContent("calendar");
  }

  function handleProfileClick() {
    setDrawerContent("profile");
  }

  function getDrawerContent() {
    switch (drawerContent) {
      case "connections":
        return <ConnectionsDrawerContainer />;
      case "calendar":
        return <CalendarDrawer />;
      case "messages":
        return <MessagesDrawer />;
      case "profile":
        return <ProfileDrawer />;
      default:
        return null;
    }
  }

  function renderIcons() {
    return (
      <>
        <IconButton
          className={styles.iconStyle}
          onClick={handleConnectionsClick}
        >
          <MdGroupAdd size={32} color="#F8F8FF" />
        </IconButton>
        {/* TODO - Discuss if we want to keep messages drawer on the event platform initially.
        Reason - Increase dev time */}
        <IconButton className={styles.iconStyle} onClick={handleMessagesClick}>
          <IoMdText size={32} color="#F8F8FF" />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleCalendarClick}>
          <FaRegCalendarAlt size={27} color="#F8F8FF" />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleProfileClick}>
          <MdAccountCircle color="#F8F8FF" size={32} />
        </IconButton>
      </>
    );
  }

  return (
    <div className={styles.wrapper}>
      <AppBar position="static" className={styles.header}>
        <Toolbar className={styles.toolbar}>
          <a href="/">
            <img
              src={RootShareLogoWhite}
              alt="RootShare"
              className={styles.headerLogo}
            />
          </a>

          <div className={styles.icons}>{renderIcons()}</div>
        </Toolbar>
        <EventDrawer
          open={Boolean(drawerContent)}
          handleClose={handleDrawerClose}
        >
          {getDrawerContent()}
        </EventDrawer>
      </AppBar>
    </div>
  );
}

export default EventClientHeader;
