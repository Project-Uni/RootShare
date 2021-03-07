import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: Theme.white,
  },
}));

type Props = {
  children?: JSX.Element | JSX.Element[] | string | number;
  style?: React.CSSProperties;
  className?: string;
  variant?: 'primary' | 'secondary';
};

export const RSCard = (props: Props) => {
  const styles = useStyles();
  const { children, style, className, variant } = props;

  return (
    <Box
      className={[styles.wrapper, className].join(' ')}
      style={{ ...style }}
      borderRadius={variant === 'primary' ? 40 : 30}
      boxShadow={2}
    >
      {children}
    </Box>
  );
};

RSCard.defaultProps = {
  variant: 'primary',
};
