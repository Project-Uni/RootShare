import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
  },
  adbox: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
}));

const AD_CYCLE_TIME = 15;

type Props = {
  height: number;
  width: number;
  advertisements: string[];
};

function EventClientAdvertisement(props: Props) {
  const styles = useStyles();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      const newAdIndex = (currentAdIndex + 1) % props.advertisements.length;
      setCurrentAdIndex(newAdIndex);
    }, 1000 * AD_CYCLE_TIME);
  }, [currentAdIndex]);

  return (
    <div
      className={styles.wrapper}
      style={{ height: props.height, width: props.width }}
    >
      <div
        className={styles.adbox}
        style={{ backgroundImage: `url(${props.advertisements[currentAdIndex]})` }}
      ></div>
    </div>
  );
}

export default EventClientAdvertisement;
