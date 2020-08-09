import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LandingHead from './landing-components/LandingHead';
import LandingBody from './landing-components/LandingBody';
import LandingFooter from './landing-components/LandingFooter';
import HypeRegistration from '../hype-page/hype-registration/HypeRegistration';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  body: {
    display: 'flex',
    paddingBottom: 20,
  },
  left: {
    textAlign: 'left',
    marginRight: 15,
  },
  right: {
    flexGrow: 1,
    marginRight: 200,
    marginTop: 25,
    marginLeft: 15,
  },
  center: {
    marginTop: 25,
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
  },
}));

const MIN_HEIGHT = 825;
const MIN_WIDTH = 1345;

type Props = {};

function LandingNew(props: Props) {
  const styles = useStyles();
  const [desktopMode, setDesktopMode] = useState(window.innerWidth >= MIN_WIDTH);
  const [height, setHeight] = useState(
    window.innerHeight >= MIN_HEIGHT ? window.innerHeight : MIN_HEIGHT
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    setDesktopMode(window.innerWidth >= MIN_WIDTH);

    if (window.innerHeight >= MIN_HEIGHT) {
      setHeight(window.innerHeight);
    }
  }

  return (
    <div className={styles.wrapper}>
      <LandingHead />
      <div className={styles.body}>
        <div className={styles.left}>{desktopMode && <LandingBody />}</div>
        {desktopMode ? (
          <div className={styles.right}>
            <HypeRegistration />
          </div>
        ) : (
          <div className={styles.center}>
            <HypeRegistration />
          </div>
        )}
      </div>
      <LandingFooter />
    </div>
  );
}

export default LandingNew;
