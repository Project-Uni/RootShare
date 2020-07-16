import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  TextField,
  Button,
  IconButton,
  FormHelperText,
} from '@material-ui/core';

import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { updateUser } from '../redux/actions/user';
import log from '../helpers/logger';

import RootShareLogoFull from '../images/RootShareLogoFull.png';
import HypeHeader from '../hype-page/headerFooter/HypeHeader';
import RSText from '../base-components/RSText';
import UserAutocomplete from './UserAutocomplete';
import AdminEventList from './AdminEventList';

const MIN_ACCESS_LEVEL = 6;
const MAX_BRIEF_LEN = 100;

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    marginTop: 100,
  },
  holder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formBody: {
    width: 400,
    border: '1px solid black',
    borderRadius: 10,
    margin: 'auto',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
  },
  rootshareLogo: {
    height: '90px',
    marginLeft: 30,
    marginBottom: 0,
    marginTop: 10,
  },
  cancelButton: {
    padding: 0,
    margin: 0,
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
    width: 200,
    marginLeft: 20,
    marginRight: 20,
  },
  dateErr: {
    padding: 0,
    margin: 0,
  },
  singleSpeaker: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speakerName: {},
  green: {
    color: 'green',
  },
  red: {
    color: 'red',
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
  const [eventDateTime, setEventDateTime] = useState(new Date());
  const [host, setHost] = useState<any>({});
  const [speakers, setSpeakers] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState('');

  const [events, setEvents] = useState<any>([]);
  const [editEvent, setEditEvent] = useState('');

  const [hostErr, setHostErr] = useState('');
  const [speakerErr, setSpeakerErr] = useState('');
  const [titleErr, setTitleErr] = useState('');
  const [briefDescErr, setBriefDescErr] = useState('');
  const [fullDescErr, setFullDescErr] = useState('');
  const [dateTimeErr, setDateTimeErr] = useState('');
  const [topMessage, setTopMessage] = useState('');

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

  useEffect(() => {
    updateEvents();
  }, []);

  async function updateEvents() {
    const { data } = await axios.get('/api/webinar/getAllEvents');
    if (data['success'] !== 1) return log('error', data['message']);
    setEvents(data['content']['webinars']);
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

  function handleDateTimeChange(dateTime: any) {
    setEventDateTime(dateTime);
  }

  function handleHostChange(_: any, newValue: any) {
    if (newValue === null) {
      setHost('');
    } else {
      setHost(newValue);
    }
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
      if (speakers.length < 8) {
        if (!containsSpeaker(newSpeaker)) {
          setSpeakers(speakers.concat(newSpeaker));
          setSpeakerErr('');
        }
      } else {
        setSpeakerErr('Maximum event speakers is 9');
      }
    }
  }

  function startEditing(event: any) {
    setEditEvent(event._id);
    setTitle(event.title);
    setBriefDesc(event.brief_description);
    setFullDesc(event.full_description);
    setEventDateTime(event.dateTime);
    setHost(event.host);
    setSpeakers(event.speakers);
  }

  async function handleSubmit() {
    let hasErr = false;
    if (title.length === 0) {
      hasErr = true;
      setTitleErr('Title is required');
    } else setTitleErr('');
    if (briefDesc.length === 0 || briefDesc.length > 100) {
      hasErr = true;
      setBriefDescErr('Brief invalid');
    } else setBriefDescErr('');
    if (fullDesc.length === 0) {
      hasErr = true;
      setFullDescErr('Description is required');
    } else setFullDescErr('');
    if (Object.keys(host).length === 0) {
      hasErr = true;
      setHostErr('Host is required');
    } else setHostErr('');
    if (speakers.length === 0) {
      hasErr = true;
      setSpeakerErr('At least one speaker is required');
    } else setSpeakerErr('');
    if (eventDateTime < new Date()) {
      hasErr = true;
      setDateTimeErr('Event cannot be in the past');
    } else setDateTimeErr('');

    if (hasErr) return;

    const speakerIDs: string[] = speakers.map((speaker) => speaker['_id']);
    const speakerEmails: string[] = speakers.map((speaker) => speaker['email']);

    const API_DATA = {
      editEvent: editEvent,
      title: title,
      brief_description: briefDesc,
      full_description: fullDesc,
      host: host,
      speakers: speakerIDs,
      dateTime: eventDateTime,
      speakerEmails: speakerEmails,
    };

    const { data } = await axios.post('/api/webinar/createEvent', API_DATA);
    updateEvents();
    if (data['success'] === 1) {
      setTopMessage(`s: ${data['message']}`);
      resetData();
    } else setTopMessage('f: There was an error creating the webinar.');
  }

  function resetData() {
    setTitle('');
    setBriefDesc('');
    setFullDesc('');
    setEventDateTime(new Date());
    setHost({});
    setSpeakers([]);
    setCurrentSpeaker('');
    setHostErr('');
    setSpeakerErr('');
    setTitleErr('');
    setBriefDescErr('');
    setFullDescErr('');
    setEditEvent('');
  }

  function removeSpeaker(index: number) {
    const newSpeakers = [...speakers];
    newSpeakers.splice(index, 1);
    setSpeakers(newSpeakers);
  }

  function renderHost() {
    return (
      <div className={styles.singleSpeaker}>
        <RSText type="subhead" className={styles.speakerName} size={14}>
          {`${host.firstName} ${host.lastName}`}
        </RSText>
        <RSText type="subhead" italic size={11}>
          {host.email}
        </RSText>
        <IconButton
          onClick={() => {
            setHost({});
          }}
        >
          <RSText type="subhead">X</RSText>
        </IconButton>
      </div>
    );
  }

  function renderSpeakers() {
    const output = [];
    for (let i = 0; i < speakers.length; i++) {
      output.push(
        <div key={speakers[i]['email']} className={styles.singleSpeaker}>
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
          error={titleErr !== ''}
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
          error={briefDescErr !== ''}
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
          required
          error={fullDescErr !== ''}
        />

        <RSText type="subhead" bold className={styles.textFieldTitle}>
          Event Date {'&'} Time
        </RSText>
        <FormHelperText error={dateTimeErr !== ''} className={styles.dateBox}>
          <p className={styles.dateErr}>{dateTimeErr}</p>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker
              margin="normal"
              label="Event Date and Time"
              format="MM/dd/yyyy @ h:mm a"
              value={eventDateTime}
              onChange={handleDateTimeChange}
              minDate={new Date()}
              minDateMessage={'Event cannot be in the past'}
              className={styles.dateBox}
            />
          </MuiPickersUtilsProvider>
        </FormHelperText>

        <RSText type="subhead" bold className={styles.textFieldTitle}>
          Host
        </RSText>
        {Object.keys(host).length === 0 ? <span /> : renderHost()}
        <UserAutocomplete
          handleAutoCompleteChange={handleHostChange}
          value={host.firstName}
          err={hostErr}
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
      <div className={styles.formBody}>
        <img
          src={RootShareLogoFull}
          className={styles.rootshareLogo}
          alt="RootShare"
        />
        <RSText type="head" size={28} className={styles.pageTitle}>
          {editEvent === '' ? 'Create New Event' : 'Update Event'}
        </RSText>
        {editEvent !== '' ? (
          <IconButton className={styles.cancelButton} onClick={resetData}>
            <RSText size={14}>Cancel Update</RSText>
          </IconButton>
        ) : (
          <span />
        )}
        <RSText
          type="subhead"
          size={14}
          italic
          className={topMessage[0] === 's' ? styles.green : styles.red}
        >
          {topMessage.substr(3, topMessage.length - 3)}
        </RSText>
        {renderFields()}
        <Button
          variant="contained"
          className={styles.submitButton}
          onClick={handleSubmit}
        >
          {editEvent === '' ? 'CREATE' : 'UPDATE'}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to="/login?redirect=/admin/createEvent" />}
      {homepageRedirect && <Redirect to="/" />}
      <HypeHeader />
      {loading ? (
        <CircularProgress
          className={styles.loadingIndicator}
          size={100}
          color="primary"
        />
      ) : (
        <div className={styles.holder}>
          {renderContent()}{' '}
          <AdminEventList events={events} handleEdit={startEditing} />
        </div>
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
