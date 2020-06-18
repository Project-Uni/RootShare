import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  eventMonth: number; // 0-11
  eventDay: number; // 1-31
  eventYear: number; // YYYY
  eventHour: number; // GMT
  eventMinute: number; // 0-59
};

function HypeEventCountdown(props: Props) {
  const styles = useStyles();
  const [remainingTime, setRemainingTime] = useState({});
  const eventDate = new Date(
    props.eventYear,
    props.eventMonth,
    props.eventDay,
    props.eventHour,
    props.eventMinute
  );

  useEffect(() => {
    setTimeout(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);
  }, [remainingTime]);

  function calculateRemainingTime() {
    const timeDiffRaw = +eventDate - +new Date();
    let timeDiff = {};
    if (timeDiffRaw > 0) {
      timeDiff = {
        days: Math.floor(timeDiffRaw / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeDiffRaw / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((timeDiffRaw / 1000 / 60) % 60),
        seconds: Math.floor((timeDiffRaw / 1000) % 60),
      };
    } else {
      timeDiff = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }
    return timeDiff;
  }

  return (
    <div className={styles.wrapper}>
      <p>{JSON.stringify(remainingTime)}</p>
    </div>
  );
}

export default HypeEventCountdown;
