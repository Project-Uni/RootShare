import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Grid } from '@material-ui/core';

import { RiCommunityLine } from 'react-icons/ri';
import { BsPeopleFill } from 'react-icons/bs';
import { MdEvent } from 'react-icons/md';

import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import { makeRequest } from '../../helpers/functions';
import RSText from '../../base-components/RSText';
import { colors } from '../../theme/Colors';

import EventClientHeader from '../../event-client/EventClientHeader';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    color: colors.primary,
    marginTop: 100,
  },
  pageTitleDiv: {
    justifyContent: 'flex-start',
    display: 'flex',
    flex: 1,
  },
  body: {
    paddingTop: 20,
    paddingLeft: 30,
    paddingRight: 40,
    paddingBottom: 20,
  },
  grid: {
    marginTop: 30,
  },
  iconBackground: {
    background: colors.primary,
    borderRadius: 100,
    padding: 20,
  },
  pageLink: {
    textDecoration: 'none',
    '&:visited': {
      color: 'inherit',
    },
  },
  pageName: {
    marginTop: 15,
    width: 150,
  },
  pageNameDiv: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const MIN_ACCESS_LEVEL = 6;

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function AdminHub(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [loginRedirect, setLoginRedirect] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);

  const pages = [
    {
      title: 'Community Manager',
      icon: <RiCommunityLine color={colors.primaryText} size={150} />,
      link: '/admin/community',
    },
    {
      title: 'User Manager',
      icon: <BsPeopleFill color={colors.primaryText} size={150} />,
      link: '/admin/count',
    },
    {
      title: 'Event Manager',
      icon: <MdEvent color={colors.primaryText} size={150} />,
      link: '/admin/event',
    },
  ];

  useEffect(() => {
    checkAuth().then((authorized) => {
      setLoading(false);
    });
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
    if (data['success'] !== 1) {
      setLoginRedirect(true);
      return false;
    } else {
      props.updateUser({ ...data['content'] });
      if (data['content']['privilegeLevel'] < MIN_ACCESS_LEVEL) {
        setShowInvalid(true);
        return false;
      }
    }
    return true;
  }

  function renderInvalid() {
    return (
      <RSText type="subhead" size={32} bold>
        Permission not granted to view page
      </RSText>
    );
  }

  function renderLinks() {
    const output = [];
    for (let i = 0; i < pages.length; i++) {
      output.push(
        <Grid item xs={12} sm={6} md={3}>
          <div style={{ display: 'inline-block' }}>
            <a href={pages[i].link} className={styles.pageLink}>
              <div className={styles.iconBackground}>{pages[i].icon}</div>
              <div className={styles.pageNameDiv}>
                <RSText type="body" bold size={14} className={styles.pageName}>
                  {pages[i].title}
                </RSText>
              </div>
            </a>
          </div>
        </Grid>
      );
    }
    return output;
  }

  function renderPageContent() {
    return (
      <div className={styles.body}>
        <div className={styles.pageTitleDiv}>
          <RSText type="head" size={24} bold>
            Admin Hub
          </RSText>
        </div>
        <Grid container spacing={3} className={styles.grid}>
          {renderLinks()}
        </Grid>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to="/login?redirect=/admin" />}
      <EventClientHeader showNavigationMenuDefault />
      {loading ? (
        <CircularProgress
          className={styles.loadingIndicator}
          size={100}
          color="primary"
        />
      ) : showInvalid ? (
        renderInvalid()
      ) : (
        renderPageContent()
      )}
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

export default connect(mapStateToProps, mapDispatchToProps)(AdminHub);
