import React, { useEffect } from 'react';
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
    height: '80%',
    width: '100%',
  },
  screenshareWebcamContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: '20%',
    width: '100%',
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
      <div
        className={styles.row}
        style={{ height: `${100 / numRows}%` }}
        key={`row${i}`}
      >
        {renderRow(
          i,
          props.numSpeakers - i >= numPerRow ? numPerRow : props.numSpeakers - i + 1,
          numPerRow
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
    }
  }

  return <>{output}</>;
}

function renderRow(startIndex: number, numElements: number, maxElements: number) {
  const output = [];
  for (let i = startIndex; i < startIndex + numElements; i++) {
    output.push(
      <div
        key={`pos${i}`}
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
  sharingPos: string;
};

export function ScreenshareLayout(props: ScreenshareProps) {
  const styles = useStyles();

  useEffect(() => {
    let containerCount = 1;
    for (let i = 0; i < props.videoElements.length; i++) {
      let currVideo = props.videoElements[i];
      if (currVideo) {
        currVideo.style.height = '100%';
        currVideo.style.width = '100%';

        if (currVideo.getAttribute('elementid') === props.sharingPos) {
          console.log(`Screensharing: ${props.sharingPos}`);
          currVideo.style['objectFit'] = 'contain';
          console.log(document.getElementById('pos0'));
          document.getElementById(`pos0`)?.appendChild(currVideo);
        } else {
          currVideo.style['objectFit'] = 'cover';
          document.getElementById(`pos${containerCount}`)?.append(currVideo);
          containerCount++;
        }
      }
    }
  });

  return (
    <>
      <div id={`pos0`} className={styles.screenView}></div>

      <div className={styles.screenshareWebcamContainer}>
        {renderScreenshareRest(props.numSpeakers)}
      </div>
    </>
  );
}

function renderScreenshareRest(numSpeakers: number) {
  const output = [];
  for (let i = 1; i <= numSpeakers; i++) {
    output.push(
      <div
        key={`pos${i}`}
        id={`pos${i}`}
        style={{ width: `${100 / 4}%`, height: '100%', border: '1px solid red' }}
      ></div>
    );
  }
  return output;
}
