import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../base-components/RSText';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 30,
  },
  body: {
    display: 'flex',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Ubuntu',
  },
}));

type Props = {
  mode: 'desktop' | 'mobile';
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

  const bigTextSize = props.mode === 'desktop' ? 80 : 36;
  const smallTextSize = props.mode === 'desktop' ? 32 : 16;
  const dayTimeMargin = props.mode === 'desktop' ? 30 : 15;

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
    let eventDate = new Date();
    eventDate.setUTCFullYear(props.eventYear);
    eventDate.setUTCMonth(props.eventMonth);
    eventDate.setUTCDate(props.eventDay);
    eventDate.setUTCHours(props.eventHour);
    eventDate.setUTCMinutes(props.eventMinute);
    eventDate.setUTCSeconds(0);

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

  function renderSingleTimeObject(name: 'days' | 'hours' | 'minutes' | 'seconds') {
    let value: any = remainingTime[name];
    if (
      (name === 'hours' || name === 'minutes' || name === 'seconds') &&
      value < 10
    ) {
      value = '0' + value;
    }
    return (
      <div
        style={{
          marginRight: name === 'days' ? dayTimeMargin : 0,
          marginLeft: name === 'hours' ? dayTimeMargin : 0,
        }}
      >
        <RSText bold type="other" size={bigTextSize} className={styles.text}>
          {value}
        </RSText>
        <RSText bold type="other" size={smallTextSize} className={styles.text}>
          {name}
        </RSText>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <RSText bold type="other" size={smallTextSize} className={styles.text}>
        COUNTDOWN TO LAUNCH
      </RSText>
      <div className={styles.body}>
        {renderSingleTimeObject('days')}
        {renderSingleTimeObject('hours')}
        <RSText bold type="other" size={bigTextSize} className={styles.text}>
          :
        </RSText>
        {renderSingleTimeObject('minutes')}
        <RSText bold type="other" size={bigTextSize} className={styles.text}>
          :
        </RSText>
        {renderSingleTimeObject('seconds')}
      </div>
    </div>
  );
}

export default HypeEventCountdown;
