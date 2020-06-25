import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, IconButton } from "@material-ui/core";
import RSText from "../../base-components/RSText";

import ConnectionsDrawer from "./ConnectionsDrawer";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "325px",
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight - 100,
  },
  headerText: {
    margin: 0,
    display: "block",
  },
  messageTest: {},
  textFieldContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: "#202020",
    borderTop: "2px solid #ffffff",
    color: "#f2f2f2",
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  textField: {
    width: 200,
    background: "#333333",
    color: "#f2f2f2",
    label: "#f2f2f2"
  },
  messageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    background: "#202020",
    overflow: "scroll",
    label: "#f2f2f2",
  },
  input: {
    color: "#f2f2f2",
    label: "#f2f2f2",
    borderWidth: "1px",
    borderColor: "#6699ff !important",
  },
  cssLabel: {
    color: "#f2f2f2",
    label: "#f2f2f2",
  },
  cssFocused: {
    color: "#f2f2f2",
    label: "#f2f2f2",
    borderWidth: '2px',
    borderColor: '#f2f2f2 !important',
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      color: "#f2f2f2 !important",
      label: "#f2f2f2 !important",
      borderWidth: '2px',
      borderColor: '#f2f2f2 !important',
    }
  },
  notchedOutline: {
    borderWidth: '2px',
    label: "#f2f2f2",
    borderColor: '#f2f2f2 !important',
    color: "#f2f2f2 !important",
  },
}));

type Props = {};

function ConnectionsDrawerContainer(props: Props) {
  const styles = useStyles();
  const [message, setMessage] = useState("");

  function testRenderMessages() {
    const output = [];
    for (let i = 0; i <= 20; i++) {
      output.push(
        <div className={styles.messageTest}>
          <ConnectionsDrawer
            name="Jackson McCluskey"
            nameId="1001"
            organization="RootShare"
            picture="jacksonsprofile.png"
          />
        </div>
      );
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
