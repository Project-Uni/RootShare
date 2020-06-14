import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  adbox: {
    width: 640,
    height: 180,
    background: "lightblue",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
}));

type Props = {};

function EventClientAdvertisement(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      {/* TODO - Remove this adbox and replace with actual ad content */}
      <div className={styles.adbox}>
        <p style={{ margin: 0 }}>
          <b>Advertisement</b>
        </p>
      </div>
    </div>
  );
}

export default EventClientAdvertisement;
