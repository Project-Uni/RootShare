import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import mtgBanner from '../../images/mtgBanner.png';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    textAlign: 'left',
    backgroundImage: `url(${mtgBanner})`,
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
        href={showNavigation ? '/mtg' : undefined}
        style={{ textDecoration: 'none' }}
      >
        <img
          src={mtgBanner}
          style={{
            height: '100%',
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
