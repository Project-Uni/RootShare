import React, { useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import RSText, { TextWeight } from '../../../base-components/RSText';

import theme from '../../../theme/Theme';
import { RSButtonVariants } from '../../reusable-components';

const useStyles = makeStyles((_: any) => ({
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.primaryText,
    height: 28,
    minWidth: 150,
    marginTop: 5,
  },
  primary: {
    background: theme.bright,
  },
  secondary: {
    background: theme.primary,
  },
  university: {
    background: theme.universityAccent['5eb89c308cc6636630c1311f'],
  },
  universitySecondary: {
    background: theme.transparent,
    borderColor: theme.universityAccent['5eb89c308cc6636630c1311f'],
    borderStyle: 'solid',
    borderWidth: 1,
  },
  disabled: {
    background: theme.disabledButton,
  },
}));

type Props = {
  tag: string;
  variant: RSButtonVariants;
  weight: TextWeight;
  fontSize: number;
  borderRadius: number;
  className?: string;
};

const Tag = (props: Props) => {
  const styles = useStyles();

  const { tag, variant, weight, fontSize, borderRadius, className } = props;
  let style = { fontSize, borderRadius };

  return (
    <div
      className={[styles.base, styles[variant], className].join(' ')}
      style={style}
    >
      <RSText size={fontSize} weight={weight}>
        {tag}
      </RSText>
    </div>
  );
};

Tag.defaultProps = {
  variant: 'primary',
  fontSize: 11,
  weight: 'normal',
  borderRadius: 12,
};

export default Tag;
