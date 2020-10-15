import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { IconButton } from '@material-ui/core';
import { BsStar, BsStarFill } from 'react-icons/bs';
import { colors } from '../theme/Colors';

import * as mojs from '@mojs/core';

const useStyles = makeStyles((_: any) => ({}));

type Props = {
  onClick: () => any;
  disabled?: boolean;
  liked?: boolean;
};

function DynamicLike(props: Props) {
  const styles = useStyles();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeline = new mojs.Timeline();

  addEffects();

  function addEffects() {
    //Circle Burst Animation
    const tween1 = new mojs.Burst({
      parent: buttonRef.current,
      duration: 1500,
      shape: 'circle',
      fill: colors.bright,
      stroke: colors.bright,
      opacity: 0.6,
      children: {
        fill: ['#DE8AA0', '#988ADE'],
      },
      childOptions: { radius: { 20: 0 } },
      radius: { 20: 80 },
      count: 6,
      isSwirl: true,
      easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
    });

    // ring animation
    const tween2 = new mojs.Transit({
      // parent: iconRef.current,
      parent: buttonRef.current,
      duration: 750,
      type: 'circle',
      radius: { 0: 40 },
      fill: 'transparent',
      stroke: '#8AD1DE',
      strokeWidth: { 15: 0 },
      opacity: 0.6,
      easing: mojs.easing.bezier(0, 1, 0.5, 1),
    });

    timeline.add(tween1, tween2);
  }

  function handleClick() {
    timeline.replay();
    props.onClick();
  }

  return (
    // <span
    //   ref={iconRef}
    //   style={{ margin: 0, padding: 0, zIndex: 999, border: '1px solid red' }}
    // >
    <IconButton onClick={handleClick} disabled={props.disabled} ref={buttonRef}>
      {props.liked ? (
        <BsStarFill color={colors.bright} size={20} />
      ) : (
        <BsStar color={colors.bright} size={20} />
      )}
    </IconButton>
    // </span>
  );
}

export default DynamicLike;
