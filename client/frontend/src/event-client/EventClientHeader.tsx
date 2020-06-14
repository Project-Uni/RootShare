import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, IconButton } from "@material-ui/core";
import RootShareLogoWhite from "../images/RootShareLogoWhite.png";
// import GroupAddIcon from "@material-ui/icons/GroupAdd";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { MdGroupAdd, MdAccountCircle } from "react-icons/md";
import { IoMdText } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flexGrow: 1,
  },
  header: {
    background: "#3D66DE",
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

  function handleConnectionsClick() {
    console.log("Connections icon clicked");
  }

  function handleMessagesClick() {
    console.log("Messages clicked");
  }

  function handleCalendarClick() {
    console.log("Calendar clicked");
  }

  function handleProfileClick() {
    console.log("Profile clicked");
  }

  function renderIcons() {
    return (
      <>
        <IconButton
          className={styles.iconStyle}
          onClick={handleConnectionsClick}
        >
          <MdGroupAdd size={32} color="white" />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleMessagesClick}>
          <IoMdText size={32} color="white" />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleCalendarClick}>
          <FaRegCalendarAlt size={27} color="white" />
        </IconButton>
        <IconButton className={styles.iconStyle} onClick={handleProfileClick}>
          <MdAccountCircle color="white" size={32} />
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
      </AppBar>
    </div>
  );
}

export default EventClientHeader;
