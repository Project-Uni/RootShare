import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';
import CommunityWow from '../../images/CommunityWow.png';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    alignSelf: 'left',
    alignItems: 'left',
    justifyContent: 'left',
    textAlign: 'left',
    height: '100%',
  },
  textLeft: {
    marginTop: 25,
    marginLeft: 200,
    alignSelf: 'left',
    alignItems: 'left',
    justifyContent: 'left',
    textAlign: 'left',
  },
  photoLeft: {
    marginTop: 25,
    marginLeft: 200,
    alignSelf: 'left',
    alignItems: 'left',
    justifyContent: 'left',
    textAlign: 'left',
  },
  login: {
    marginTop: 25,
    marginRight: 250,
    alignSelf: 'right',
    alignItems: 'right',
    justifyContent: 'right',
    textAlign: 'right',
  },
}));

type Props = {};

function LandingBody() {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <div>
        <RSText
          type="head"
          size={25}
          color={colors.second}
          className={styles.textLeft}
        >
          Every success story is rooted in the support from a community.
        </RSText>
        <img
          src={CommunityWow}
          alt="RootShare-Landing-Image"
          className={styles.photoLeft}
        />
      </div>
    </div>
  );
}

export default LandingBody;
