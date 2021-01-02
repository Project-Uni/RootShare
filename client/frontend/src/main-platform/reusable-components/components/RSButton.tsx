import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  base: {
    color: theme.altText,
    '&:hover': {
      background: theme.buttonHighlight,
    },
  },
  primary: {
    background: theme.bright,
  },
  secondary: {
    background: theme.primary,
  },
  disabled: {
    background: theme.disabledButton,
  },
}));

type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
};

const RSButton = (props: Props) => {
  const styles = useStyles();

  const { children, disabled, variant, className, onClick } = props;

  const coreStyle = useRef(
    variant === 'primary' ? styles.primary : styles.secondary
  );

  return (
    <Button
      className={[
        className,
        styles.base,
        disabled ? styles.disabled : coreStyle.current,
      ].join(' ')}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

RSButton.defaultProps = {
  variant: 'primary',
};

export default RSButton;
