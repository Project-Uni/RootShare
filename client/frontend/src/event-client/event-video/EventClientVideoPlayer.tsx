import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  videoContent: {
    background: "black",
  },
}));

type Props = {
  height: number;
  width: number;
};

function EventClientVideoPlayer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      {/* TODO-Remove this tag (videoContent) and replace it with the actual video player code */}
      <div
        className={styles.videoContent}
        style={{ height: props.height, width: props.width }}
      ></div>
    </div>
  );
}

export default EventClientVideoPlayer;
