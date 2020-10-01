import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.primaryText,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 8,
    borderRadius: 10,
  },
  box: {
    marginLeft: 8,
    marginRight: 8,
  },
}));

type Props = {};

function CommunityMakePostContainer(props: Props) {
  const styles = useStyles();
  return (
    <Box boxShadow={2} className={styles.box} borderRadius={10}>
      <div className={styles.wrapper}>
        <p>Make Post Container</p>
      </div>
    </Box>
  );
}

export default CommunityMakePostContainer;
