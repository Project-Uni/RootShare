import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, ButtonGroup, Button } from '@material-ui/core';
import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';
import { FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ContactModal from './ContactModal';

const useStyles = makeStyles((_: any) => ({
  footer: {
    marginTop: '5px',
    background: colors.second,
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
  },
  instagramIcon: {
    marginTop: 5,
    marginLeft: 5,
  },
}));

type Props = {};

const MIN_WIDTH = 450;

function LandingFooter(props: Props) {
  const styles = useStyles();

  const [contact, setContact] = useState(false);

  const [width, setWidth] = useState(
    window.innerWidth > MIN_WIDTH ? window.innerWidth : MIN_WIDTH
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  function handleResize() {
    if (window.innerWidth > MIN_WIDTH) setWidth(window.innerWidth);
  }

  function openContactModal() {
    setContact(true);
  }

  function closeContactModal() {
    setContact(false);
  }

  return (
    <AppBar position="static" className={styles.footer} style={{ width }}>
      <Toolbar>
        <div className={styles.footerContainer}>
          <ContactModal open={contact} onClick={closeContactModal}></ContactModal>
          <ButtonGroup variant="text" aria-label="text primary button group">
            {/* <Button>
              <RSText type="body" size={12} color={colors.primaryText}>
                ABOUT
              </RSText>
            </Button>
            <Button>
              <RSText type="body" size={12} color={colors.primaryText}>
                HELP
              </RSText>
            </Button>
            <Button>
              <RSText type="body" size={12} color={colors.primaryText}>
                PRIVACY
              </RSText>
            </Button>
            <Button>
              <RSText type="body" size={12} color={colors.primaryText}>
                TERMS
              </RSText>
            </Button>
            <Button>
              <RSText type="body" size={12} color={colors.primaryText}>
                LANGUAGE
              </RSText>
            </Button> */}
            <a href="https://www.instagram.com/rootshare/">
              <FaInstagram
                color={colors.primaryText}
                size={30}
                className={styles.instagramIcon}
              />
            </a>
            <Button onClick={openContactModal}>
              <RSText type="body" size={12} color={colors.primaryText}>
                CONTACT
              </RSText>
            </Button>
          </ButtonGroup>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default LandingFooter;
