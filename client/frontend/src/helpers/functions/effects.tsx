import React from 'react';
import { TransitionProps } from '@material-ui/core/transitions';
import { Slide } from '@material-ui/core';

export function slideLeft(props: TransitionProps) {
  return <Slide {...props} direction="left" />;
}
