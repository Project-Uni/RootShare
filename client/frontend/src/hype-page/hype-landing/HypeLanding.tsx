import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import HypeDesktopBody from "./HypeDesktopBody";
import HypeMobileBody from "./HypeMobileBody";
import HypeHeader from "../headerFooter/HypeHeader";
import HypeFooter from "../headerFooter/HypeFooter";
import HypeParticipatingOrganizations from "./HypeParticipatingOrganizations";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  bottom: {},
}));

type Props = {};

function HypeLanding(props: Props) {
  const styles = useStyles();
  const [desktopMode, setDesktopMode] = useState(window.innerWidth >= 1230);

  useEffect(() => {
    window.addEventListener("resize", updateWindow);
  }, []);

  function updateWindow() {
    setDesktopMode(window.innerWidth >= 1230);
  }

  const eventDescription = `
    RootShare is proud to present a special event on August 15th 2020,
    where speakers will talk about their experience as Purdue athletes,
    and what life has been like for them post graduation. RootShare is
    proud to present a special event on August 15th 2020, where speakers
    will talk about their experience as Purdue athletes, and what life
    has been like for them post graduation.
  `;

  return (
    <div className={styles.wrapper}>
      <HypeHeader />

      {desktopMode ? (
        <HypeDesktopBody eventDescription={eventDescription} />
      ) : (
        <HypeMobileBody eventDescription={eventDescription} />
      )}
      <div className={styles.bottom}>
        <HypeParticipatingOrganizations />
      </div>
      <HypeFooter />
    </div>
  );
}

export default HypeLanding;
