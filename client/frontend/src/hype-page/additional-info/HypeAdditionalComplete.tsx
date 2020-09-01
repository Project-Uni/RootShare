import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import PurdueLogo from '../../images/purdueLogo.png';

const useStyles = makeStyles((_: any) => ({
  completeText: {
    fontSize: '13pt',
    textAlign: 'left',
    margin: 0,
    fontfamily: 'Ubuntu',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
  },
  finishWrapper: {
    marginTop: '20px',
  },
  logoStyle: {
    height: '100px',
    width: '100px',
  },
}));

type Props = {};

function HypeAdditionalComplete(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.finishWrapper}>
      <Typography className={styles.completeText}>
        <b>Thanks for signing up for RootShare!</b>
      </Typography>
      <Typography className={styles.completeText}>
        Stay tuned for updates!
      </Typography>
      <Typography className={styles.completeText}>
        Once again, <b>Boiler Up!</b>
      </Typography>
      <img src={PurdueLogo} alt="Purdue Logo" className={styles.logoStyle} />
    </div>
  );
}

export default HypeAdditionalComplete;
