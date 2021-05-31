import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, ButtonGroup, Button } from '@material-ui/core';
import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';
import { FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ContactModal from '../redesign/modals/ContactModal';
import Theme from '../../theme/Theme';
import { AiOutlineBgColors } from 'react-icons/ai';

const useStyles = makeStyles((_: any) => ({
  footer: {
    marginTop: '5px',
    background: Theme.primary,
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
          <ContactModal open={contact} onClose={closeContactModal}></ContactModal>
          <ButtonGroup variant="text" aria-label="text primary button group">
            {/* <Button>
              <RSText type="body" size={12} color={Theme.white}>
                ABOUT
              </RSText>
            </Button>
            <Button>
              <RSText type="body" size={12} color={Theme.white}>
                HELP
              </RSText>
            </Button>
            <Button>
              <RSText type="body" size={12} color={Theme.white}>
                PRIVACY
              </RSText>
            </Button>
            <Button>
              <RSText type="body" size={12} color={Theme.white}>
                TERMS
              </RSText>
            </Button>
            <Button>
              <RSText type="body" size={12} color={Theme.white}>
                LANGUAGE
              </RSText>
            </Button> */}
            <a href="https://www.instagram.com/rootshare/">
              <FaInstagram
                color={Theme.white}
                size={30}
                className={styles.instagramIcon}
              />
            </a>
            <Button onClick={openContactModal}>
              <RSText type="body" size={12} color={Theme.white}>
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
