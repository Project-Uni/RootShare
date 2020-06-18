import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import HypeDesktopBody from "./HypeDesktopBody";
import HypeMobileBody from "./HypeMobileBody";
import HypeHeader from "../headerFooter/HypeHeader";
import HypeFooter from "../headerFooter/HypeFooter";
import HypeParticipatingOrganizations from "./HypeParticipatingOrganizations";
import HypeEventCountdown from "./HypeEventCountdown";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  bottom: {},
}));

type Props = {};

function HypeLanding(props: Props) {
  const styles = useStyles();
  const [desktopMode, setDesktopMode] = useState(window.innerWidth >= 1230);

  const event = {
    eventMonth: 7,
    eventDay: 14,
    eventYear: 2020,
    eventHour: 16, //P
    eventMinute: 0,
  };
  useEffect(() => {
    window.addEventListener("resize", updateWindow);
  }, []);

  function updateWindow() {
    setDesktopMode(window.innerWidth >= 1230);
  }

  const eventDescription = `
    Robbie Hummel, Jajuan Johnson, and E’twaun Moore are reuniting on a RootShare virtual 
    event to share their Purdue story and how this has shaped them into the people they are 
    today. With the first hour broken up into three sections, our guests will share their 
    college life memories, expand on their post grad experiences, and end with advice they 
    would have given to their younger selves. The remaining forty-five minutes of the event 
    will be open to our viewers and their questions they have for the Baby Boilers. 
    We are excited to bring these outstanding alumni back in touch with their Purdue roots 
    and hear first hand what it means to be a boilermaker.
  `;

  return (
    <div className={styles.wrapper}>
      <HypeHeader />

      {desktopMode ? (
        <HypeDesktopBody eventDescription={eventDescription} />
      ) : (
        <HypeMobileBody eventDescription={eventDescription} />
      )}
      <div>
        <HypeEventCountdown {...event} />
      </div>
      <div className={styles.bottom}>
        <HypeParticipatingOrganizations />
      </div>
      <HypeFooter />
    </div>
  );
}

export default HypeLanding;
