import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import RSText from "../../base-components/RSText";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 30,
  },
  body: {
    display: "flex",
    justifyContent: "center",
  },
  days: {
    marginRight: 60,
  },
}));

type Props = {
  mode: "desktop" | "mobile";
  eventMonth: number; // 0-11
  eventDay: number; // 1-31
  eventYear: number; // YYYY
  eventHour: number; // GMT
  eventMinute: number; // 0-59
};

function HypeEventCountdown(props: Props) {
  const styles = useStyles();
  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
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

  function calculateRemainingTime(): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const timeDiffRaw = +eventDate - +new Date();
    let timeDiff = { ...remainingTime };
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

  function renderSingleTimeObject(
    name: "days" | "hours" | "minutes" | "seconds"
  ) {
    let value: any = remainingTime[name];
    if (
      (name === "hours" || name === "minutes" || name === "seconds") &&
      value < 10
    ) {
      value = "0" + value;
    }
    return (
      <div className={name === "days" ? styles.days : undefined}>
        <RSText bold type="head" size={80}>
          {value}
        </RSText>
        <RSText bold type="head" size={32}>
          {name}
        </RSText>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <RSText bold type="head" size={32}>
        COUNTDOWN TO LAUNCH
      </RSText>
      <div className={styles.body}>
        {renderSingleTimeObject("days")}
        {renderSingleTimeObject("hours")}
        <RSText bold type="head" size={80}>
          :
        </RSText>
        {renderSingleTimeObject("minutes")}
        <RSText bold type="head" size={80}>
          :
        </RSText>
        {renderSingleTimeObject("seconds")}
      </div>
    </div>
  );
}

export default HypeEventCountdown;
