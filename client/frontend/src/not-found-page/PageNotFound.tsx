import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import RSText from '../base-components/RSText';
import HypeHeader from '../hype-page/headerFooter/HypeHeader';
import HypeFooter from '../hype-page/headerFooter/HypeFooter';

const minHeight = 400;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100vw',
    height: '100vh',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  RSText: {
    width: '100vw',
    textAlign: 'center',
    marginTop: 100,
  },
}));

type Props = {};

export default function PageNotFound(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(window.innerHeight - 195);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    if (window.innerHeight >= minHeight) setHeight(window.innerHeight - 195);
  }

  return (
    <div className={styles.wrapper}>
      <HypeHeader />
      <div className={styles.body} style={{ height: height }}>
        <RSText type="head" className={styles.RSText} size={32}>
          404 Error: Page Not Found
        </RSText>
      </div>
      <HypeFooter />
    </div>
  );
}
