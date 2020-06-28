import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import OT, { Session, Publisher } from '@opentok/client';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
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
      <p>I am the event admin container</p>
    </div>
  );
}

export default EventAdminContainer;
