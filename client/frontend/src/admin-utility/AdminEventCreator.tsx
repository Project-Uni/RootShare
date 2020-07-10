import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, TextField, Button } from '@material-ui/core';

import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { updateUser } from '../redux/actions/user';

import RootShareLogoFull from '../images/RootShareLogoFull.png';
import HypeHeader from '../hype-page/headerFooter/HypeHeader';
import RSText from '../base-components/RSText';

const MIN_ACCESS_LEVEL = 8;
const MAX_BRIEF_LEN = 100;

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    marginTop: 100,
  },
  body: {
    width: 400,
    border: '1px solid black',
    margin: 'auto',
    paddingLeft: 20,
    paddingRight: 20,
    // textAlign: 'left',
  },
  rootshareLogo: {
    height: '90px',
    marginLeft: 30,
    marginBottom: 10,
    marginTop: 20,
  },
  submitButton: {
    width: 250,
    background: '#3D66DE',
    '&:hover': {
      background: '#7c97e9',
    },
    fontSize: 16,
    color: 'white',
  },
  textField: {
    width: 400,
    marginBottom: 15,
  },
  pageTitle: {
    marginBottom: 20,
  },
  textFieldTitle: {
    width: '100%',
    textAlign: 'left',
    marginBottom: 5,
  },
}));

type Props = {
  user: { [key: string]: any };
  updateUser: (userInfo: { [key: string]: any }) => void;
};

function AdminEventCreator(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState(false);
  const [homepageRedirect, setHomepageRedirect] = useState(false);

  const [briefCharsRemaining, setBriefCharsRemaining] = useState(MAX_BRIEF_LEN);

  const [title, setTitle] = useState('');
  const [briefDesc, setBriefDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');

  useEffect(() => {
    setLoading(true);
    if (checkAuth()) {
      setLoading(false);
    }
  }, []);

  async function checkAuth() {
    const { data } = await axios.get('/user/getCurrent');
    if (data['success'] !== 1) {
      setLoginRedirect(true);
      return false;
    } else {
      updateUser({ ...data['content'] });
      if (data['content']['privilegeLevel'] < MIN_ACCESS_LEVEL) {
        setHomepageRedirect(true);
        return false;
      }
    }
    return true;
  }

  function handleTitleChange(event: any) {
    setTitle(event.target.value);
  }

  function handleBriefDescChange(event: any) {
    setBriefDesc(event.target.value);
    setBriefCharsRemaining(MAX_BRIEF_LEN - event.target.value.length);
  }

  function handleFullDescChange(event: any) {}

  function handleSubmit() {
    console.log(`Title: ${title}\nBrief: ${briefDesc}\nFull: ${fullDesc}`);
  }

  function renderFields() {
    return (
      <>
        <RSText type="subhead" bold className={styles.textFieldTitle}>
          Event Title
        </RSText>
        <TextField
          variant="outlined"
          label="Title"
          className={styles.textField}
          value={title}
          onChange={handleTitleChange}
          required
        />

        <RSText type="subhead" bold className={styles.textFieldTitle}>
          Brief Event Description
        </RSText>
        <TextField
          variant="outlined"
          label="Brief"
          className={styles.textField}
          multiline
          helperText={`This is a highlight of the event (Max ${MAX_BRIEF_LEN} Chars). ${briefCharsRemaining} remaining`}
          value={briefDesc}
          onChange={handleBriefDescChange}
          rowsMax={3}
          rows={1}
          required
        />

        <RSText type="subhead" bold className={styles.textFieldTitle}>
          Full Event Description
        </RSText>
        <TextField
          variant="outlined"
          label="Full"
          className={styles.textField}
          multiline
          helperText={`This is a full description of the event`}
          value={fullDesc}
          onChange={handleFullDescChange}
          rows={2}
          required
        />
      </>
    );
  }

  function renderContent() {
    return (
      <div className={styles.body}>
        <img
          src={RootShareLogoFull}
          className={styles.rootshareLogo}
          alt="RootShare"
        />
        <RSText type="head" size={32} className={styles.pageTitle}>
          Create New Event
        </RSText>
        {renderFields()}
        <Button
          variant="contained"
          className={styles.submitButton}
          onClick={handleSubmit}
        >
          CREATE
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to="/login" />}
      {homepageRedirect && <Redirect to="/" />}
      <HypeHeader />
      {loading ? (
        <CircularProgress
          className={styles.loadingIndicator}
          size={100}
          color="primary"
        />
      ) : (
        renderContent()
      )}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminEventCreator);
