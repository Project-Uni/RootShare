import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { SINGLE_DIGIT } from '../../../types/types';

const useStyles = makeStyles((_: any) => ({
  videoQuadrant: {
    width: '50%',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  screenView: {
    flexGrow: 1,
    height: '100%',
  },
  screenshareContainer: {
    display: 'flex',
    height: '100%',
  },
  screenshareWebcamContainer: {
    width: 250,
    height: '100%',
  },
}));

type VideoLayoutProps = {
  numSpeakers: SINGLE_DIGIT;
  videoElements: (HTMLVideoElement | HTMLObjectElement)[];
};

export function VideosOnlyLayout(props: VideoLayoutProps) {
  const styles = useStyles();
  const numRows = Math.ceil(props.numSpeakers / 3);
  const numPerRow = Math.ceil(Math.sqrt(props.numSpeakers));

  const output = [];
  for (let i = 1; i <= props.numSpeakers; i += numPerRow) {
    output.push(
      <div className={styles.row} style={{ height: `${100 / numRows}%` }}>
        {renderRow(
          i,
          props.numSpeakers - i >= numPerRow ? numPerRow : props.numSpeakers - i + 1,
          numPerRow,
          props.videoElements
        )}
      </div>
    );
  }

  for (let i = 0; i < props.videoElements.length; i++) {
    let currVideo = props.videoElements[i];
    if (currVideo) {
      currVideo.style.height = '100%';
      currVideo.style.width = '100%';
      currVideo.style['objectFit'] = 'cover';
      document.getElementById(`pos${i + 1}`)?.appendChild(currVideo);
      // console.log(currVideo);
    }
  }

  return <>{output}</>;
}

function renderRow(
  startIndex: number,
  numElements: number,
  maxElements: number,
  videoElements: (HTMLVideoElement | HTMLObjectElement)[]
) {
  // console.log(videoElements);
  const output = [];
  for (let i = startIndex; i < startIndex + numElements; i++) {
    output.push(
      <div
        id={`pos${i}`}
        style={{
          width: `${100 / maxElements}%`,
          border: '1px solid red',
        }}
      ></div>
    );
  }
  return output;
}

type ScreenshareProps = {
  numSpeakers: SINGLE_DIGIT;
  videoElements: (HTMLVideoElement | HTMLObjectElement)[];
  sharingPos: SINGLE_DIGIT;
};

export function ScreenshareLayout(props: ScreenshareProps) {
  const styles = useStyles();
  return (
    <>
      <div className={styles.screenshareContainer}>
        <div id={`pos${props.sharingPos}`} className={styles.screenView}></div>
        <div className={styles.screenshareWebcamContainer}>
          {renderScreenshareRest({ ...props })}
        </div>
      </div>
    </>
  );
}

function renderScreenshareRest({ numSpeakers, sharingPos }: ScreenshareProps) {
  const output = [];
  for (let i = 1; i <= numSpeakers; i++) {
    if (i != sharingPos)
      output.push(
        <div
          id={`pos${i}`}
          style={{ width: '100%', height: `${100 / 3}%`, border: '1px solid red' }}
        ></div>
      );
  }
  return output;
}
