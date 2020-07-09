import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { colors } from "../../theme/Colors";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import SingleEvent from "./SingleEvent";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: "400px",
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight - 60,
  },
  textFieldContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: colors.primaryText,
    borderTop: "2px solid " + colors.primaryText,
    color: colors.secondary,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  connectionContainer: {
    flex: 1,
    justifyContent: "flex-end",
    //background: colors.secondary,
    overflow: "scroll",
    label: colors.primaryText,
  },
}));

type Props = {};

function CalendarDrawer(props: Props) {
  const styles = useStyles();
  const [message, setMessage] = useState("");

  function testRenderConnections() {
    const output = [];
    for (let i = 0; i < 20; i++) {
      output.push(
        <div >
          <SingleEvent
            eventID="1001"
            eventName="The Baby Boilers Are Back"
            eventDescription="14"
            organization="RootShare"
            day="14"
            month="Aug"
            year="2020"
            time="7"
            ampm="PM"
            timezone="EST"
            picture="babyboilers.png"
          />
        </div>
      )
    }
    return output;
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.connectionContainer}>{testRenderConnections()}</div>
    </div>
  );
}

export default CalendarDrawer;
