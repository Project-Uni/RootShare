import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import RSText from "../base-components/RSText";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "300px",
    border: "1px solid red",
  },
  textTest: {
    color: "blue",
    margin: 0,
    textAlign: "left",
  },
}));

type Props = {};

function EventMessageContainer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <RSText type="head" bold italic size={24} style={styles.textTest}>
        Hello World!
      </RSText>
    </div>
  );
}

export default EventMessageContainer;
