import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import HypeRegistration from "../hype-registration/HypeRegistration";
import HypeEventDescription from "./HypeEventDescription";

const useStyles = makeStyles((_: any) => ({
  body: {
    display: "flex",
    justifyContent: "",
    marginTop: "20px",
  },
  left: {
    textAlign: "left",
    marginLeft: "20px",
    marginRight: "80px",
  },
  right: {
    flexGrow: 1,
    marginRight: 30,
  },
  bottom: {},
}));

type Props = {
  eventDescription: string;
};

function HypeDesktopBody(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.body}>
      <div className={styles.left}>
        <HypeEventDescription
          eventDescription={props.eventDescription}
          mode="desktop"
        />
      </div>
      <div className={styles.right}>
        <HypeRegistration />
      </div>
    </div>
  );
}

export default HypeDesktopBody;
