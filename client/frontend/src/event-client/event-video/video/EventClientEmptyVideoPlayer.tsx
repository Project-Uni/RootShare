import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../../base-components/RSText';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  videoContent: {
    background: 'black',
    verticalAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
  },
}));

type Props = {
  height: number;
  width: number;
};

function EventClientEmptyVideoPlayer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.videoContent}
        style={{ height: props.height, width: props.width }}
      >
        <RSText type="subhead" className={styles.text} size={16}>
          The event has not started yet
        </RSText>
      </div>
    </div>
  );
}

export default EventClientEmptyVideoPlayer;
