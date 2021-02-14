import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import Theme from '../../../theme/Theme';
import { RSLink } from '..';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: Theme.white,
  },
}));

type Props = {
  className?: string;
  style?: React.CSSProperties;
  src?: string;
  href?: string;
};

export const FeaturedEvent = (props: Props) => {
  const styles = useStyles();
  const { className, style, src, href } = props;

  return (
    <Box
      borderRadius={10}
      boxShadow={2}
      className={[className, styles.wrapper].join(' ')}
      style={style}
    >
      <RSLink href={href}>
        <img
          src={src}
          style={{
            width: '100%',
            objectFit: 'contain',
            borderRadius: 10,
          }}
        />
      </RSLink>
    </Box>
  );
};
