import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import HypeDesktopBody from './HypeDesktopBody';
import HypeMobileBody from './HypeMobileBody';
import HypeHeader from '../headerFooter/HypeHeader';
import LandingHead from '../../landing-page/landing-components/LandingHead';
import HypeFooter from '../headerFooter/HypeFooter';
import HypeParticipatingOrganizations from './HypeParticipatingOrganizations';
import HypeEventCountdown from './HypeEventCountdown';
import HypeTeamInfo from './HypeTeamInfo';

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
    eventHour: 16, //Pacific Time
    eventMinute: 0,
  };
  useEffect(() => {
    window.addEventListener('resize', updateWindow);
  }, []);

  function updateWindow() {
    setDesktopMode(window.innerWidth >= 1230);
  }

  const eventDescription = `
    Robbie Hummel, Jajuan Johnson, and E’twaun Moore are reuniting on a RootShare virtual 
    event to share their Purdue story and how this has shaped them into the people they are 
    today. 
  `;

  return (
    <div className={styles.wrapper}>
      <LandingHead />

      {desktopMode ? (
        <HypeDesktopBody eventDescription={eventDescription} />
      ) : (
        <HypeMobileBody eventDescription={eventDescription} />
      )}
      <HypeEventCountdown {...event} mode={desktopMode ? 'desktop' : 'mobile'} />
      <div className={styles.bottom}>
        <HypeParticipatingOrganizations />
        <HypeTeamInfo />
      </div>
      <HypeFooter />
    </div>
  );
}

export default HypeLanding;
