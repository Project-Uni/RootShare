import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import HypeRegistration from "../hype-registration/HypeRegistration";
import HypeEventDescription from "./HypeEventDescription";

const useStyles = makeStyles((_: any) => ({
  top: {
    display: "block",
    textAlign: "left",
    marginLeft: "20px",
    marginTop: "20px",
  },
  bottom: {
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    marginTop: 40,
  },
}));

type Props = {
  eventDescription: string;
};

function HypeMobileBody(props: Props) {
  const styles = useStyles();
  return (
    <>
      <div className={styles.top}>
        <HypeEventDescription
          eventDescription={props.eventDescription}
          mode="mobile"
        />
      </div>
      <div className={styles.bottom}>
        <HypeRegistration />
      </div>
    </>
  );
}

export default HypeMobileBody;
