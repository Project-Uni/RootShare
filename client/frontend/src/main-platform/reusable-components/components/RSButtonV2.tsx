import React, { useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  base: {
    color: theme.primaryText,
  },
  noCaps: {
    textTransform: 'none',
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
    background: theme.foreground,
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

type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'university' | 'universitySecondary';
  noCaps?: boolean;
  fontSize: number;
  borderRadius: number;
  style: React.CSSProperties;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const RSButtonV2 = (props: Props) => {
  const styles = useStyles();

  const {
    children,
    disabled,
    variant,
    noCaps,
    fontSize,
    borderRadius,
    className,
    onClick,
  } = props;
  let { style } = props;
  style = { ...style, fontSize, borderRadius };

  console.log(children);

  const getCoreStyle = useCallback(() => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'university':
        return styles.university;
      case 'universitySecondary':
        return styles.universitySecondary;
      case 'primary':
      default:
        return styles.primary;
    }
  }, [variant]);

  const coreStyle = useRef(getCoreStyle());

  return (
    <Button
      className={[
        className,
        styles.base,
        disabled ? styles.disabled : coreStyle.current,
        noCaps && styles.noCaps,
      ].join(' ')}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </Button>
  );
};

RSButtonV2.defaultProps = {
  variant: 'primary',
  fontSize: 12,
  borderRadius: 12,
  style: {},
};

export default RSButtonV2;
