import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

import { RSText } from '../../base-components';
import GrandPrixBanner from '../../images/grand-prix-banner.png';

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
        {/* <img
          src={GrandPrixBanner}
          style={{
            display: 'block',
            height: '10%',
            width: '100%',
            objectFit: 'contain',
            borderRadius: 10,
          }}
        /> */}

        <div //This is temporary until we get the banner image for Grand Prix
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: 200,
            background: Theme.background,
            borderRadius: 25,
          }}
        >
          <RSText weight="bold" color={Theme.secondaryText} size={50}>
            Grand Prix Events
          </RSText>
        </div>
      </a>
    </Box>
  );
}

export default MeetTheGreeksInfoCard;
