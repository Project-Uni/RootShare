import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaInstagram } from 'react-icons/fa';

import RootShareLogoWhite from '../../images/RootShareLogoWhite.png';

import Theme from '../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  footer: {
    background: Theme.primary,
    paddingTop: '20px',
    paddingBottom: '10px',
  },
  footerLogo: {
    height: '40px',
  },
  footerText: {
    fontFamily: 'Ubuntu',
    color: 'white',
  },
  instagramIcon: {
    height: 50,
    width: 50,
    color: 'white',
    '&:hover': {
      color: 'rgb(220,220,220)',
    },
  },
  instagramLink: {
    marginTop: '20px',
  },
}));

type Props = {
  minWidth?: number;
};

function HypeFooter(props: Props) {
  const styles = useStyles();
  const [width, setWidth] = useState(
    props.minWidth
      ? window.innerWidth >= props.minWidth
        ? window.innerWidth
        : props.minWidth
      : window.innerWidth
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    if (props.minWidth) {
      if (window.innerWidth >= props.minWidth) setWidth(window.innerWidth);
    } else setWidth(window.innerWidth);
  }
  return (
    <div className={styles.footer} style={{ width: width }}>
      <img src={RootShareLogoWhite} className={styles.footerLogo} alt="RootShare" />
      <br />
      <a
        href="https://www.instagram.com/rootshare/"
        className={styles.instagramLink}
      >
        <FaInstagram className={styles.instagramIcon} />
      </a>
    </div>
  );
}

export default HypeFooter;
