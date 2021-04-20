import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

import { RSText } from '../../base-components';
import { GrandPrixPromotionBanner } from '../../images';

import Theme from '../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    textAlign: 'left',
    backgroundSize: '100% 100%',
  },
  button: {
    position: 'relative',
    paddingLeft: 30,
  },
}));

type Props = {
  className?: string;
  showNavigation?: boolean;
};

function MeetTheGreeksInfoCard(props: Props) {
  const styles = useStyles();

  const { className, showNavigation } = props;
  return (
    <Box
      borderRadius={10}
      boxShadow={2}
      className={[className, styles.wrapper].join(' ')}
    >
      <a
        href={showNavigation ? '/grand-prix' : undefined}
        style={{ textDecoration: 'none' }}
      >
        <img
          src={GrandPrixPromotionBanner}
          style={{
            display: 'block',
            height: '10%',
            width: '100%',
            objectFit: 'contain',
            borderRadius: 10,
          }}
        />
      </a>
    </Box>
  );
}

export default MeetTheGreeksInfoCard;
