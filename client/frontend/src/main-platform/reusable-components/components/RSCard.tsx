import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

import Theme, { customShadow } from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    margin: 10,
  },
  primaryBackground: {
    background: Theme.foreground,
    boxShadow: Theme.fullShadow,
  },
  secondaryBackground: {
    background: Theme.secondaryForeground,
    boxShadow: customShadow(0, 0, 4, '#222222', 0.4),
  },
}));

type Props = {
  children?: JSX.Element | JSX.Element[] | string | number;
  style?: React.CSSProperties;
  className?: string;
  variant: 'primary' | 'secondary';
  background: 'primary' | 'secondary';
};

export const RSCard = (props: Props) => {
  const styles = useStyles();
  const { children, style, className, variant, background } = props;

  return (
    <Box
      className={[
        styles.wrapper,
        background === 'primary'
          ? styles.primaryBackground
          : styles.secondaryBackground,
        className,
      ].join(' ')}
      style={{ ...style }}
      borderRadius={variant === 'primary' ? 40 : 30}
      // boxShadow={2}
    >
      {children}
    </Box>
  );
};

RSCard.defaultProps = {
  variant: 'primary',
  background: 'primary',
};
