import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Grid } from '@material-ui/core';

import { RiCommunityLine } from 'react-icons/ri';
import { BsPeopleFill } from 'react-icons/bs';
import { MdEvent } from 'react-icons/md';

import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import RSText from '../../base-components/RSText';

import EventClientHeader from '../../event-client/EventClientHeader';
import { RSLink } from '../../main-platform/reusable-components';
import { FaDatabase } from 'react-icons/fa';
import Theme from '../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    color: Theme.bright,
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
    background: Theme.bright,
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
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [showInvalid, setShowInvalid] = useState(false);

  const pages = [
    {
      title: 'Community Manager',
      icon: <RiCommunityLine color={Theme.altText} size={150} />,
      link: '/admin/community',
    },
    {
      title: 'User Manager',
      icon: <BsPeopleFill color={Theme.altText} size={150} />,
      link: '/admin/count',
    },
    {
      title: 'Event Manager',
      icon: <MdEvent color={Theme.altText} size={150} />,
      link: '/admin/event',
    },
    {
      title: 'Database Portal',
      icon: <FaDatabase color={Theme.altText} size={150} />,
      link: '/admin/database',
    },
  ];

  useEffect(() => {
    checkAuth().then((authorized) => {
      setLoading(false);
    });
  }, []);

  async function checkAuth() {
    if (!Boolean(props.accessToken)) {
      history.push('/login?redirect=/admin/event');
      return false;
    } else if (props.user.privilegeLevel < MIN_ACCESS_LEVEL) {
      setShowInvalid(true);
      return false;
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
            <RSLink href={pages[i].link} className={styles.pageLink}>
              <div className={styles.iconBackground}>{pages[i].icon}</div>
              <div className={styles.pageNameDiv}>
                <RSText type="body" bold size={14} className={styles.pageName}>
                  {pages[i].title}
                </RSText>
              </div>
            </RSLink>
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
