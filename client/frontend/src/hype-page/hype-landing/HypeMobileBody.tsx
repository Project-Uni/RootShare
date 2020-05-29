import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import HypeBackground from "../../images/PurdueHypeAlt.png";
import HypeRegistration from "../hype-registration/HypeRegistration";

const useStyles = makeStyles((_: any) => ({
  missionStatement: {
    textAlign: "left",
    margin: 0,
    padding: 0,
    height: "auto",
    fontFamily: "Ubuntu",
    width: Math.min(700, window.innerWidth - 40),
    marginBottom: "20px",
    fontSize: 28,
  },
  top: {
    display: "block",
    textAlign: "left",
    marginLeft: "20px",
  },
  bottom: {
    // flexGrow: 1,
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    marginTop: 40,
    // marginRight: 30,
  },
  eventImage: {
    // width: "700px",
    width: Math.min(700, window.innerWidth - 40),
  },
  eventDate: {
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
}));

type Props = {
  eventDescription: string;
};

function HypeMobileBody(props: Props) {
  const styles = useStyles();
  return (
    <>
      <div className={styles.top}>
        <Typography className={styles.missionStatement} variant="h4">
          Every success story is rooted in the support from a community.
        </Typography>
        <img
          src={HypeBackground}
          className={styles.eventImage}
          alt={`Robbie Hummel, JaJuan Johnson, and E${"'"}Twaun Moore`}
        />
        <Typography className={styles.eventDate} variant="h4">
          AUGUST 15, 2020
        </Typography>
        <Typography variant="h5" className={styles.eventText}>
          {props.eventDescription}
        </Typography>
        <Typography variant="h5" className={styles.registerText}>
          Register for the event now!
        </Typography>
      </div>
      <div className={styles.bottom}>
        <HypeRegistration />
      </div>
    </>
  );
}

export default HypeMobileBody;
