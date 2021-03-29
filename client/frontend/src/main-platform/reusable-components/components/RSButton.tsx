import React, { useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  base: {
    color: theme.altText,
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
  disabled: {
    background: theme.disabledButton,
  },
}));

type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'university' | 'universityRound';
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const RSButton = (props: Props) => {
  const styles = useStyles();

  const { children, disabled, variant, className, style, onClick } = props;

  const getCoreStyle = useCallback(() => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'university':
        return styles.university;
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
      ].join(' ')}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </Button>
  );
};

RSButton.defaultProps = {
  variant: 'primary',
};

export default RSButton;
