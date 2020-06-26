import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PendingConnectionsDrawer from "./PendingConnectionsDrawer";
import { colors } from "../../theme/Colors";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "350px",
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight / 2.5,
  },
  headerText: {
    margin: 0,
    display: "block",
  },
  messageTest: {},
  textFieldContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: colors().primary,
    color: colors().primaryText,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  textField: {
    width: 200,
    background: colors().secondary,
    color: colors().primaryText,
    label: colors().primaryText
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: "#242d56",
    overflow: "scroll",
    label: colors().primaryText,
  },
  input: {
    color: colors().primaryText,
    label: colors().primaryText,
    borderWidth: "1px",
    borderColor: "#6699ff !important",
  },
  cssLabel: {
    color: colors().primaryText,
    label: colors().primaryText,
  },
  cssFocused: {
    color: colors().primaryText,
    label: colors().primaryText,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: colors().primaryText,
      label: colors().primaryText,
    }
  },
  notchedOutline: {
    borderWidth: '2px',
    label: colors().primaryText,
    borderColor: colors().primaryText,
    color: colors().primaryText,
  },
}));

type Props = {};

function ConnectionsDrawerContainer(props: Props) {
  const styles = useStyles();
  const [message, setMessage] = useState("");

  function testRenderMessages() {
    const output = [];
    for (let i = 0; i <= 30; i++) {
      output.push(
        <div className={styles.messageTest}>
          <PendingConnectionsDrawer
            name="Jeff Bezos"
            nameId="1002"
            organization="Amazon"
            picture="jeffsprofile.png"
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

export default ConnectionsDrawerContainer;
