import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { CircularProgress } from '@material-ui/core';

import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/functions';

import RSText from '../../base-components/RSText';
import EventClientHeader from '../../event-client/EventClientHeader';
import AdminCreateCommunity from './AdminCreateCommunity';
import AdminCommunitiesList from './AdminCommunitiesList';

import { colors } from '../../theme/Colors';

const MIN_ACCESS_LEVEL = 6;

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    color: colors.primary,
    marginTop: 100,
  },
  body: {
    flex: 1,
    paddingTop: 15,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 15,
  },
  pageTitleDiv: {
    textAlign: 'left',
  },
  contentBody: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  contentBodyRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
  },
}));

//TODO - Update user type
type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function AdminCommunityManager(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [loginRedirect, setLoginRedirect] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);

  const [communities, setCommunities] = useState<{ [key: string]: any }[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(async (authorized) => {
      if (authorized) {
        fetchCommunities().then(() => {
          setCommunitiesLoading(false);
        });
      }
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

  async function fetchCommunities() {
    const { data } = await makeRequest(
      'GET',
      '/api/admin/communities',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    console.log('Data:', data);
    setCommunities(data.content['communities']);
  }

  function renderInvalid() {
    return (
      <RSText type="subhead" size={32} bold>
        Permission not granted to view page
      </RSText>
    );
  }

  function renderPageContent() {
    return (
      <div className={styles.body}>
        <div className={styles.pageTitleDiv}>
          <RSText size={24} type="head" bold>
            Manage Communities
          </RSText>
        </div>
        <div className={styles.contentBody}>
          <AdminCreateCommunity
            accessToken={props.accessToken}
            refreshToken={props.refreshToken}
          />
          <div className={styles.contentBodyRight}>
            {/* <p>Existing Communities</p> */}
            <AdminCommunitiesList />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to="/login?redirect=/admin/community" />}
      <EventClientHeader showNavigationWidth={9999} />
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

export default connect(mapStateToProps, mapDispatchToProps)(AdminCommunityManager);
