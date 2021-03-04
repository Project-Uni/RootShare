import React, { useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import theme from '../../../theme/Theme';
import { TextTransformType } from '../../../base-components/RSText';

const useStyles = makeStyles((_: any) => ({
  base: {
    color: theme.primaryText,
  },
  primary: {
    background: theme.bright,
    '&:hover': {
      background: theme.brightHover,
    },
  },
  secondary: {
    background: theme.primary,
    '&:hover': {
      background: theme.primaryHover,
    },
  },
  university: {
    background: theme.universityAccent['5eb89c308cc6636630c1311f'],
    '&:hover': {
      background: theme.primaryHover,
    },
  },
  universitySecondary: {
    background: theme.transparent,
    borderColor: theme.universityAccent['5eb89c308cc6636630c1311f'],
    borderStyle: 'solid',
    borderWidth: 1,
    '&:hover': {
      background: theme.primaryHover,
    },
  },
  disabled: {
    background: theme.disabledButton,
  },
}));

export type RSButtonVariants =
  | 'primary'
  | 'secondary'
  | 'university'
  | 'universitySecondary';

type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
  variant: RSButtonVariants;
  caps?: TextTransformType;
  fontSize: number;
  borderRadius: number;
  style: React.CSSProperties;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onHover?: (hovering: boolean) => void;
};

const RSButtonV2 = (props: Props) => {
  const styles = useStyles();

  const {
    children,
    disabled,
    variant,
    caps,
    fontSize,
    borderRadius,
    className,
    onClick,
    onHover,
  } = props;
  let { style } = props;
  style = { ...style, fontSize, borderRadius, textTransform: caps };

  return (
    <Button
      className={[
        className,
        styles.base,
        disabled ? styles.disabled : styles[variant],
      ].join(' ')}
      disabled={disabled}
      onClick={onClick}
      style={style}
      onMouseEnter={() => onHover && onHover(true)}
      onMouseLeave={() => onHover && onHover(false)}
    >
      {children}
    </Button>
  );
};

RSButtonV2.defaultProps = {
  variant: 'primary',
  fontSize: 12,
  borderRadius: 12,
  caps: 'none',
  style: {},
};

export default RSButtonV2;
