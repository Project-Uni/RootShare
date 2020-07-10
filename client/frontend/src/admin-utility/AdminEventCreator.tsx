import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, TextField, Button, IconButton } from '@material-ui/core';

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { updateUser } from '../redux/actions/user';

import RootShareLogoFull from '../images/RootShareLogoFull.png';
import HypeHeader from '../hype-page/headerFooter/HypeHeader';
import RSText from '../base-components/RSText';
import UserAutocomplete from './UserAutocomplete';

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
  dateBox: {
    width: 150,
    marginLeft: 20,
    marginRight: 20,
  },
  singleSpeaker: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speakerName: {
    // border: '1px solid red',
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
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [hostID, setHostID] = useState('');
  const [speakers, setSpeakers] = useState([]);
  const [currentSpeaker, setCurrentSpeakear] = useState('');

  const [speakerErr, setSpeakerErr] = useState('');

  const dateFns = new DateFnsUtils();

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

  function handleFullDescChange(event: any) {
    setFullDesc(event.target.value);
  }

  function handleDateChange(date: any) {
    setEventDate(date);
  }

  function handleTimeChange(time: any) {
    setEventTime(time);
  }

  function handleHostChange(_: any, newValue: any) {
    if (newValue === null) {
      setHostID('');
    } else setHostID(newValue['_id']);
  }

  const containsSpeaker = (newSpeaker: { [key: string]: string }) => {
    for (let i = 0; i < speakers.length; i++) {
      if (speakers[i]['email'] === newSpeaker['email']) {
        setSpeakerErr('Speaker has already been added');
        return true;
      }
    }
    setSpeakerErr('');
    return false;
  };

  function handleSpeakerChange(_: any, newSpeaker: any) {
    if (newSpeaker !== null) {
      if (speakers.length < 9) {
        if (!containsSpeaker(newSpeaker)) {
          setSpeakers(speakers.concat(newSpeaker));
          setSpeakerErr('');
        }
      } else {
        setSpeakerErr('Maximum event speakers is 9');
      }
    }
  }

  function handleSubmit() {
    console.log(`Title: ${title}\nBrief: ${briefDesc}\nFull: ${fullDesc}`);
    const date = dateFns.format(eventDate, `MM/dd/yyy`);
    const time = dateFns.format(eventTime, 'hh:mm:ss aa');
    console.log(`Date: ${date}, Time: ${time}`);
    console.log('Host:', hostID);
  }

  function removeSpeaker(index: number) {
    const newSpeakers = [...speakers];
    newSpeakers.splice(index, 1);
    setSpeakers(newSpeakers);
  }

  function renderSpeakers() {
    const output = [];
    for (let i = 0; i < speakers.length; i++) {
      output.push(
        <div className={styles.singleSpeaker}>
          <RSText type="subhead" className={styles.speakerName} size={14}>
            {speakers[i]['firstName'] + ' ' + speakers[i]['lastName']}{' '}
          </RSText>
          <RSText type="subhead" italic size={11}>
            {speakers[i]['email']}
          </RSText>
          <IconButton
            onClick={() => {
              removeSpeaker(i);
            }}
          >
            <RSText type="subhead">X</RSText>
          </IconButton>
        </div>
      );
    }
    return output;
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

        <RSText type="subhead" bold className={styles.textFieldTitle}>
          Event Date {'&'} Time
        </RSText>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            margin="normal"
            label="Event Date"
            format="MM/dd/yyyy"
            value={eventDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
            className={styles.dateBox}
          />
          <KeyboardTimePicker
            margin="normal"
            label="Event Time"
            value={eventTime}
            onChange={handleTimeChange}
            KeyboardButtonProps={{
              'aria-label': 'change time',
            }}
            className={styles.dateBox}
          />
        </MuiPickersUtilsProvider>

        <RSText type="subhead" bold className={styles.textFieldTitle}>
          Host
        </RSText>
        <UserAutocomplete
          handleAutoCompleteChange={handleHostChange}
          value={hostID}
          err={''}
          label="Host"
        />

        <RSText type="subhead" bold className={styles.textFieldTitle}>
          Speakers
        </RSText>
        {renderSpeakers()}
        <UserAutocomplete
          handleAutoCompleteChange={handleSpeakerChange}
          value={currentSpeaker}
          err={speakerErr}
          label="Speakers"
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
