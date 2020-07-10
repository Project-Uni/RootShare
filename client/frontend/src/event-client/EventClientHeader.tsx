import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, IconButton } from "@material-ui/core";
import RootShareLogoWhite from "../images/RootShareLogoWhite.png";

import { MdGroupAdd, MdAccountCircle } from "react-icons/md";
import { IoMdText } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";

import EventDrawer from "./EventDrawer";

// import ConnectionsDrawer from "./drawer-components/ConnectionsDrawer";

import { colors } from "../theme/Colors"

import {
  CalendarDrawer,
  MessagesDrawer,
  ProfileDrawer,
  ConnectionsDrawer,
} from "./drawer-components";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    // flexGrow: 1,
  },
  header: {
    background: colors.secondary,
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

type Props = {
  minWidth: number;
};

function EventClientHeader(props: Props) {
  const styles = useStyles();
  const [drawerContent, setDrawerContent] = useState("");
  const [width, setWidth] = useState(window.innerWidth >= props.minWidth
    ? window.innerWidth
    : props.minWidth
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    if (window.innerWidth >= props.minWidth) setWidth(window.innerWidth);
  }

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
        return <ConnectionsDrawer />;
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
          <MdGroupAdd size={32} color={colors.primaryText} />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleMessagesClick}>
          <IoMdText size={32} color={colors.primaryText} />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleCalendarClick}>
          <FaRegCalendarAlt size={27} color={colors.primaryText} />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleProfileClick}>
          <MdAccountCircle color={colors.primaryText} size={32} />
        </IconButton>
      </>
    );
  }

  return (
    <div className={styles.wrapper} style={{ width: width, minWidth: props.minWidth }}>
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
          backgroundColor={drawerContent==="calendar" ? colors.secondary : colors.secondary}
        >
          {getDrawerContent()}
        </EventDrawer>
      </AppBar>
    </div>
  );
}

export default EventClientHeader;
