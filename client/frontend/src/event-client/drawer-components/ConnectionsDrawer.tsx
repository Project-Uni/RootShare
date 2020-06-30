import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import SingleConnection from "./SingleConnection";
import SinglePendingConnection from "./SinglePendingConnection";

import { colors } from "../../theme/Colors";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "400px",
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight - 60,
  },
  headerText: {
    margin: 0,
    display: "block",
  },
  messageTest: {},
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
  textField: {
    width: 200,
    background: colors.secondary,
    color: colors.primaryText,
    label: colors.primaryText
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: colors.secondary,
    overflow: "scroll",
    label: colors.primaryText,
  },
  input: {
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssLabel: {
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssFocused: {
    color: colors.primaryText,
    label: colors.primaryText,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: colors.primaryText,
      label: colors.primaryText,
      borderWidth: '2px',
      borderColor: colors.primaryText,
    }
  },
  notchedOutline: {
    borderWidth: '2px',
    label: colors.primaryText,
    color: colors.primaryText,
  },
}));

type Props = {};

function ConnectionsDrawer(props: Props) {
  const styles = useStyles();
  const [message, setMessage] = useState("");

  function testRenderMessages() {
    const output = [];
    for (let i = 0; i < 1; i++) {
      output.push(
        <div className={styles.messageTest}>
          <SinglePendingConnection
            name="Ashwin Mahesh"
            nameId="1002"
            organization="RootShare"
            picture="jeffsprofile.png"
          />
        </div>
      )
      output.push(
        <div className={styles.messageTest}>
          <SinglePendingConnection
            name="Dhruv Patel"
            nameId="1003"
            organization="RootShare"
            picture="jeffsprofile.png"
          />
        </div>
      )
      output.push(
        <div className={styles.messageTest}>
          <SinglePendingConnection
            name="Lauren Odle"
            nameId="1004"
            organization="RootShare"
            picture="jeffsprofile.png"
          />
        </div>
      )
      output.push(
        <div className={styles.messageTest}>
          <SinglePendingConnection
            name="Chris Hartley"
            nameId="1004"
            organization="RootShare"
            picture="jeffsprofile.png"
          />
        </div>
      )
    }
    for (let i = 0; i <= 10; i++) {
      output.push(
        <div className={styles.messageTest}>
          <SingleConnection
            name="Jackson McCluskey"
            nameId="2001"
            organization="RootShare"
            picture="jacksonsprofile.png"
          />
        </div>
      );
      output.push(
        <div className={styles.messageTest}>
          <SingleConnection
            name="Smit Desai"
            nameId="2002"
            organization="RootShare"
            picture="elonsprofile.png"
          />
        </div>
      )
      output.push(
        <div className={styles.messageTest}>
          <SingleConnection
            name="Caite Capezzuto"
            nameId="2003"
            organization="RootShare"
            picture="elonsprofile.png"
          />
        </div>
      )
      output.push(
        <div className={styles.messageTest}>
          <SingleConnection
            name="Caite Capezzuto"
            nameId="2004"
            organization="RootShare"
            picture="elonsprofile.png"
          />
        </div>
      )
    }
    return output;
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.messageContainer}>{testRenderMessages()}</div>
    </div>
  );
}

export default ConnectionsDrawer;
