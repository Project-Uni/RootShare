import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import HypeBackground from "../../images/PurdueHypeAlt.png";

const useStyles = (mode: string) =>
  makeStyles((_: any) => ({
    wrapper: {},
    missionStatement: {
      textAlign: "left",
      margin: 0,
      padding: 0,
      height: "auto",
      fontFamily: "Ubuntu",
      width: Math.min(700, window.innerWidth - 40),
      marginBottom: "20px",
      fontSize: mode === "desktop" ? 32 : 28,
    },
    eventImage: {
      width: Math.min(700, window.innerWidth - 40),
    },
    eventTitle: {
      fontFamily: "Ubuntu",
      fontWeight: "bold",
    },
    eventText: {
      width: Math.min(700, window.innerWidth - 40),
      fontFamily: "Ubuntu",
      marginTop: 15,
      fontSize: "13pt",
    },
    registerText: {
      fontWeight: "bold",
      fontFamily: "Ubuntu",
      marginTop: "10px",
    },
    eventDate: {
      fontFamily: "Ubuntu",
      fontWeight: "bold",
      fontSize: "20pt",
    },
  }));

type Props = {
  eventDescription: string;
  mode: "desktop" | "mobile";
};

function HypeEventDescription(props: Props) {
  const styles = useStyles(props.mode)();
  return (
    <div className={styles.wrapper}>
      <Typography className={styles.missionStatement} variant="h4">
        Every success story is rooted in the support from a community.
      </Typography>
      <img
        src={HypeBackground}
        className={styles.eventImage}
        alt={`Robbie Hummel, JaJuan Johnson, and E${"'"}Twaun Moore`}
      />
      <Typography className={styles.eventTitle} variant="h4">
        THE BABY BOILERS ARE BACK
      </Typography>
      <Typography className={styles.eventDate} variant="h4">
        AUGUST 14, 2020 @ 7PM EST
      </Typography>
      <Typography variant="h5" className={styles.eventText}>
        {props.eventDescription}
      </Typography>
      <Typography variant="h5" className={styles.registerText}>
        Register for the event now!
      </Typography>
    </div>
  );
}

export default HypeEventDescription;
