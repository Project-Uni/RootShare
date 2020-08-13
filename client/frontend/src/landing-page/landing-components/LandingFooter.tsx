import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, ButtonGroup, Button } from '@material-ui/core';
import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';
import { FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((_: any) => ({
  footer: {
    marginTop: '5px',
    background: colors.second,
    width: '100vw',
  },
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
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

function LandingFooter(props: Props) {
  const styles = useStyles();
  return (
    <AppBar position="static" className={styles.footer}>
      <Toolbar>
        <div className={styles.footerContainer}>
          <ButtonGroup variant="text" aria-label="text primary button group">
            <Button>
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
            </Button>
            <a href="https://www.instagram.com/rootshare/">
              <FaInstagram
                color={colors.primaryText}
                size={30}
                className={styles.instagramIcon}
              />
            </a>
          </ButtonGroup>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default LandingFooter;
