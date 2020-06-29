import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import OT, { Session, Publisher } from '@opentok/client';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  buttonContainer: {},
}));

type Props = {};

function EventAdminContainer(props: Props) {
  const styles = useStyles();

  const [canScreenShare, setCanScreenShare] = useState(false);
  const [webcamPublisher, setWebcamPublisher] = useState(new Publisher());
  const [screenPublisher, setScreenPublisher] = useState(new Publisher());
  const [session, setSession] = useState(new Session());

  return (
    <div className={styles.wrapper}>
      <div className="videoContainer"></div>
      <div className={styles.buttonContainer}></div>
    </div>
  );
}

export default EventAdminContainer;
