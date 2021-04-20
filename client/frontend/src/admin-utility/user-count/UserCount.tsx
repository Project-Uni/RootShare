import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Grid, CircularProgress, Button } from '@material-ui/core';

import { CSVDownload } from 'react-csv';

import { connect } from 'react-redux';

import RootShareLogoFull from '../../images/RootShareLogoFull.png';

import EventClientHeader from '../../event-client/EventClientHeader';
import RSText from '../../base-components/RSText';
import AccountTypePieChart from './AccountTypePieChart';

import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/functions';
import { colors } from '../../theme/Colors';
import { useHistory } from 'react-router-dom';

const MIN_ACCESS_LEVEL = 6;

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  textStyle: {
    textAlign: 'center',
  },
  rootshareLogo: {
    height: '90px',
    marginLeft: 30,
    marginBottom: 10,
    marginTop: 20,
  },
  textField: {
    width: 300,
    marginTop: 30,
  },
  grid: {
    marginTop: 30,
  },
  gridItem: {
    marginTop: 15,
  },
  chart: {
    width: 300,
  },
  chartContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 20,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 30,
  },
  downloadButton: {
    background: colors.bright,
    color: colors.primaryText,
    paddingLeft: 20,
    paddingRight: 20,
    '&:hover': {
      color: colors.secondary,
    },
  },
  downloadLink: {
    display: 'none',
  },
}));

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function UserCount(props: Props) {
  const styles = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [showInvalid, setShowInvalid] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([
    { firstName: '', lastName: '', createdAt: '' },
  ]);
  const [joinedToday, setJoinedToday] = useState(0);
  const [typeCount, setTypeCount] = useState({
    student: 0,
    alumni: 0,
    faculty: 0,
    recruiter: 0,
  });
  const [searched, setSearched] = useState('');
  const [performDownload, setPerformDownload] = useState(false);

  useEffect(() => {
    checkAuth().then(async (authorized) => {
      if (authorized) {
        await fetchUsers();
      }
      setLoading(false);
    });
  }, []);

  async function checkAuth() {
    if (!Boolean(props.accessToken)) {
      history.push('/login?redirect=/admin/count');
      return false;
    } else if (props.user.privilegeLevel < MIN_ACCESS_LEVEL) {
      setShowInvalid(true);
      return false;
    }
    return true;
  }

  async function fetchUsers() {
    const { data } = await makeRequest('GET', '/api/admin/userCount');
    if (data.success === 1) {
      setAllUsers(data['content']['users']);
      setUsers(data['content']['users']);
      setTypeCount({
        student: data['content']['studentCount'],
        alumni: data['content']['alumniCount'],
        faculty: data['content']['facultyCount'],
        recruiter: data['content']['recruiterCount'],
      });
      calculateJoinedToday(data['content']['users']);
    }
  }

  function calculateJoinedToday(users: [any]) {
    let newUserCount = 0;
    const currentDate = new Date();

    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const morning = new Date(year, month, day, 5, 0);

    for (let i = 0; i < users.length; i++) {
      if ('createdAt' in users[i]) {
        const difference = +new Date(users[i]['createdAt']) - +morning;
        const hourDiff = Math.floor(difference / (1000 * 60 * 60));

        if (hourDiff > 0) {
          newUserCount += 1;
        }
      }
    }
    setJoinedToday(newUserCount);
  }

  function handleDownloadClicked() {
    setPerformDownload(true);
    setTimeout(() => {
      setPerformDownload(false);
    }, 300);
  }

  function handleSearchChange(event: any) {
    const searchQuery = event.target.value.toLowerCase();
    setSearched(event.target.value);
    const output: any[] = [];
    for (let i = 0; i < allUsers.length; i++) {
      const username = (
        allUsers[i]['firstName'] +
        ' ' +
        allUsers[i]['lastName']
      ).toLowerCase();
      if (username.includes(searchQuery)) {
        output.push(allUsers[i]);
      }
    }
    setUsers(output);
  }

  function renderUsers() {
    const output = [];

    for (let i = 0; i < users.length; i++) {
      output.push(
        <Grid item xs={6} sm={3} className={styles.gridItem}>
          <RSText type="subhead" className={styles.textStyle} size={15}>
            {i + 1}. {users[i]['firstName']} {users[i]['lastName']}
          </RSText>
        </Grid>
      );
    }
    return output;
  }

  function renderPageContent() {
    return (
      <>
        <RSText type="head" className={styles.textStyle} size={32}>
          {allUsers.length} Users
        </RSText>

        <div style={{ marginTop: 20 }}>
          <RSText type="head" className={styles.textStyle} size={24}>
            {joinedToday} joined today
          </RSText>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.chart}>
            <AccountTypePieChart mode="doughnut" data={typeCount} />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <RSText type="subhead" className={styles.textStyle} size={14}>
            {typeCount['student']} Students | {typeCount['alumni']} Alumni
          </RSText>
          <RSText type="subhead" className={styles.textStyle} size={14}>
            {typeCount['faculty']} Faculty | {typeCount['recruiter']} Recruiters
          </RSText>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 15 }}>
          <Button
            className={styles.downloadButton}
            size="large"
            onClick={handleDownloadClicked}
          >
            Download
          </Button>
          {performDownload && (
            <CSVDownload
              data={allUsers}
              target="_blank"
              filename="rootshare-users.csv"
            />
          )}
        </div>

        <TextField
          variant="outlined"
          type="search"
          label="Find a User"
          className={styles.textField}
          value={searched}
          onChange={handleSearchChange}
        />
        <Grid container spacing={3} className={styles.grid}>
          {renderUsers()}
        </Grid>
      </>
    );
  }

  function renderInvalid() {
    return (
      <RSText type="subhead" size={32} bold>
        Permission not granted to view page
      </RSText>
    );
  }

  return (
    <div className={styles.wrapper}>
      <EventClientHeader showNavigationMenuDefault />
      <img
        src={RootShareLogoFull}
        className={styles.rootshareLogo}
        alt="RootShare"
      />
      <br />
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

export default connect(mapStateToProps, mapDispatchToProps)(UserCount);
