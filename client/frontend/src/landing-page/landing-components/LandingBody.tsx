import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';

import LandingImage from '../../images/iconandphrase.png';
import Theme from '../../theme/Theme';

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
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  photoLeft: {
    marginTop: 25,
    marginLeft: 200,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: 600,
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
        {/*<RSText
          type="head"
          size={25}
          color={Theme.primary}
          className={styles.textLeft}
        >
          Let's grow together!
        </RSText>*/}
        <img
          src={LandingImage}
          alt="RootShare-Landing-Image"
          className={styles.photoLeft}
        />
      </div>
    </div>
  );
}

export default LandingBody;
