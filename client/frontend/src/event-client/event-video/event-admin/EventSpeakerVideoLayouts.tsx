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
}));

type Props = {
  numSpeakers: SINGLE_DIGIT;
};

function calculateNumPerRow(numSpeakers: SINGLE_DIGIT) {
  if (numSpeakers <= 2) return 1;
  else if (numSpeakers <= 4) return 2;
  else return 3;
}

export function VideosOnlyLayout(props: Props) {
  const styles = useStyles();
  const numRows = Math.ceil(props.numSpeakers / 3);
  const numPerRow = calculateNumPerRow(props.numSpeakers);

  const output = [];
  for (let i = 1; i <= props.numSpeakers; i += numPerRow) {
    output.push(
      <div className={styles.row} style={{ height: `${100 / numRows}%` }}>
        {renderRow(
          i,
          props.numSpeakers - i >= numPerRow ? numPerRow : props.numSpeakers - i + 1,
          numPerRow
        )}
      </div>
    );
  }
  return <>{output}</>;
}

function renderRow(startIndex: number, numElements: number, maxElements: number) {
  const output = [];
  for (let i = startIndex; i < startIndex + numElements; i++) {
    output.push(
      <div
        id={`pos${i}`}
        style={{
          width: `${100 / maxElements}%`,
        }}
      ></div>
    );
  }
  return output;
}

export function renderScreenshareLayout(props: any) {
  return {};
}
