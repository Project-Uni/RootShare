import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import HypeBackground from "../../images/PurdueHypeAlt.png";
import HypeRegistration from "../hype-registration/HypeRegistration";

const useStyles = makeStyles((_: any) => ({
  body: {
    display: "flex",
    justifyContent: "",
    marginTop: "20px",
  },
  missionStatement: {
    textAlign: "left",
    margin: 0,
    padding: 0,
    height: "auto",
    fontFamily: "Ubuntu",
    width: 700,
    marginBottom: "20px",
    fontSize: 32,
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
  eventImage: {
    width: "700px",
  },
  eventDate: {
    fontFamily: "Ubuntu",
    fontWeight: "bold",
  },
  eventText: {
    width: 700,
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

function HypeDesktopBody(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.body}>
      <div className={styles.left}>
        <Typography className={styles.missionStatement} variant="h4">
          Every success story is rooted in the support from a community.
        </Typography>
        <img
          src={HypeBackground}
          className={styles.eventImage}
          alt={`Robbie Hummel, JaJuan Johnson, and E${"'"}Twaun Moore`}
        />
        <Typography className={styles.eventDate} variant="h4">
          AUGUST 14, 2020
        </Typography>
        <Typography variant="h5" className={styles.eventText}>
          {props.eventDescription}
        </Typography>
        <Typography variant="h5" className={styles.registerText}>
          Register for the event now!
        </Typography>
      </div>
      <div className={styles.right}>
        <HypeRegistration />
      </div>
    </div>
  );
}

export default HypeDesktopBody;
