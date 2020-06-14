import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  videoContent: {
    width: 640,
    height: 480,
    background: "black",
  },
}));

type Props = {};

function EventClientVideoPlayer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      {/* TODO-Remove this tag (videoContent) and replace it with the actual video player code */}
      <div className={styles.videoContent}></div>
    </div>
  );
}

export default EventClientVideoPlayer;
