import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../redux/actions/token';

import { makeRequest } from '../helpers/functions';

import LandingHead from './landing-components/LandingHead';
import LandingBody from './landing-components/LandingBody';
import LandingFooter from './landing-components/LandingFooter';
import HypeRegistration from '../hype-page/hype-registration/HypeRegistration';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  body: {
    display: 'flex',
    paddingBottom: 20,
  },
  left: {
    textAlign: 'left',
    marginRight: 15,
  },
  right: {
    flexGrow: 1,
    marginRight: 200,
    marginTop: 25,
    marginLeft: 15,
  },
  center: {
    marginTop: 25,
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
  },
}));

const MIN_HEIGHT = 825;
const MIN_WIDTH = 1345;

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function LandingPage(props: Props) {
  const styles = useStyles();
  const [desktopMode, setDesktopMode] = useState(window.innerWidth >= MIN_WIDTH);
  const [redirectHome, setRedirectHome] = useState(false);

  const [height, setHeight] = useState(
    window.innerHeight >= MIN_HEIGHT ? window.innerHeight : MIN_HEIGHT
  );

  const redirectURL = '/event/5f30b4488e8fb07262044e9f';

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await makeRequest(
      'GET',
      '/user/getCurrent',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] === 1) {
      props.updateUser({ ...data['content'] });
      setRedirectHome(true);
    }
  }

  function handleResize() {
    setDesktopMode(window.innerWidth >= MIN_WIDTH);

    if (window.innerHeight >= MIN_HEIGHT) {
      setHeight(window.innerHeight);
    }
  }

  return (
    <div className={styles.wrapper}>
      {redirectHome && <Redirect to={redirectURL} />}
      <LandingHead />
      <div className={styles.body}>
        <div className={styles.left}>{desktopMode && <LandingBody />}</div>
        {desktopMode ? (
          <div className={styles.right}>
            <HypeRegistration />
          </div>
        ) : (
          <div className={styles.center}>
            <HypeRegistration />
          </div>
        )}
      </div>
      <LandingFooter />
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
    updateAccessToken: (accessToken: string) => {
      dispatch(updateAccessToken(accessToken));
    },
    updateRefreshToken: (refreshToken: string) => {
      dispatch(updateRefreshToken(refreshToken));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
