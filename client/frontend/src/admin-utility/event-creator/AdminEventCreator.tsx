import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  TextField,
  Button,
  IconButton,
  FormHelperText,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';

import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import { connect } from 'react-redux';

import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';

import RootShareLogoFull from '../../images/RootShareLogoFull.png';
import EventClientHeader from '../../event-client/EventClientHeader';
import RSText from '../../base-components/RSText';
import UserAutocomplete from './UserAutocomplete';
import AdminEventList from './AdminEventList';
import { colors } from '../../theme/Colors';

import { EventType, HostType, SpeakerType } from '../../helpers/types';
import { makeRequest, log } from '../../helpers/functions';
import { useHistory } from 'react-router-dom';

const MIN_ACCESS_LEVEL = 6;
const MAX_BRIEF_LEN = 100;

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    marginTop: 100,
  },
  holder: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid black',
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    margin: 10,
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
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  submitButton: {
    width: '30%',
    background: '#3D66DE',
    '&:hover': {
      background: '#7c97e9',
    },
    fontSize: 16,
    color: 'white',
  },
  emailButton: {
    width: '30%',
    background: colors.secondaryText,
    fontSize: 16,
    color: colors.primaryText,
  },
  deleteButton: {
    width: '30%',
    background: colors.error,
    '&:hover': {
      background: '#ff4444',
    },
    fontSize: 16,
    color: 'white',
  },
  loadingGray: {
    width: '60%',
    background: '#555555',
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
  privateSelect: {
    width: 150,
    textAlign: 'left',
  },
  imageWrapper: {
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  uploadedImage: {
    alignSelf: 'center',
    maxHeight: 250,
    maxWidth: '100%',
    objectFit: 'contain',
  },
  imageSection: {
    height: 400,
  },
  imagePreviewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '90%',
    borderRadius: 8,
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

function AdminEventCreator(props: Props) {
  const styles = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);

  const [briefCharsRemaining, setBriefCharsRemaining] = useState(MAX_BRIEF_LEN);

  const [title, setTitle] = useState('');
  const [briefDesc, setBriefDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [eventDateTime, setEventDateTime] = useState(new Date());
  const [host, setHost] = useState<HostType | {}>({});
  const [speakers, setSpeakers] = useState<SpeakerType[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState('');
  const [eventImage, setEventImage] = useState<string>('');
  const [editImage, setEditImage] = useState<string>('');
  const [eventBanner, setEventBanner] = useState<string>('');
  const [editBanner, setEditBanner] = useState<string>('');

  const [events, setEvents] = useState<EventType[]>([]);
  const [editEvent, setEditEvent] = useState('');

  const [hostErr, setHostErr] = useState('');
  const [speakerErr, setSpeakerErr] = useState('');
  const [titleErr, setTitleErr] = useState('');
  const [briefDescErr, setBriefDescErr] = useState('');
  const [fullDescErr, setFullDescErr] = useState('');
  const [dateTimeErr, setDateTimeErr] = useState('');
  const [topMessage, setTopMessage] = useState('');

  const [isDev, setIsDev] = useState<'yes' | 'no'>('no');
  const [isPrivate, setIsPrivate] = useState<'yes' | 'no'>('no');

  const eventImageUploader = useRef<HTMLInputElement>(null);
  const eventBannerUploader = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
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

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data } = await makeRequest('GET', '/api/webinar/getAllEventsAdmin');
    if (data['success'] !== 1) return log('error', data['message']);
    setEvents(data['content']['webinars']);
  }

  function handleTitleChange(event: any) {
    setTitle(event.target.value);
  }

  function handleEventImageClicked() {
    eventImageUploader.current?.click();
  }

  function handleEventBannerClicked() {
    eventBannerUploader.current?.click();
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

  function handleHostChange(_: any, newValue: HostType) {
    if (newValue === null) {
      setHost({});
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

  function handlePrivateChange(event: any) {
    setIsPrivate(event.target.value);
  }

  function handleIsDevChange(event: any) {
    setIsDev(event.target.value);
  }

  function handleEventImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      if (event.target.files[0].size > 1050000) {
        setTopMessage('f: Image file must be smaller than 1MB');
        event.target.value = '';
        return;
      }
      const imageReader = new FileReader();

      imageReader.onloadend = (event: ProgressEvent) => {
        const resultBuffer = imageReader.result;
        setEventImage(resultBuffer as string);
      };

      imageReader.readAsDataURL(event.target.files[0]);
      event.target.value = '';
    }
  }

  function handleEventBannerUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      if (event.target.files[0].size > 1050000) {
        setTopMessage('f: Image file must be smaller than 1MB');
        event.target.value = '';
        return;
      }
      const imageReader = new FileReader();

      imageReader.onloadend = (event: ProgressEvent) => {
        const resultBuffer = imageReader.result;
        setEventBanner(resultBuffer as string);
      };

      imageReader.readAsDataURL(event.target.files[0]);
      event.target.value = '';
    }
  }

  function startEditing(event: EventType) {
    setEditEvent(event._id);
    setTitle(event.title);
    setBriefDesc(event.brief_description);
    setFullDesc(event.full_description);
    setEventDateTime(event.dateTime);
    setHost(event.host);
    setSpeakers(event.speakers as SpeakerType[]);
    setIsPrivate(event.isPrivate ? 'yes' : 'no');
    setEventImage(event.eventImage);
    setEditImage(event.eventImage);
    setEventBanner(event.eventBanner);
    setEditBanner(event.eventBanner);
    setIsDev(event.isDev ? 'yes' : 'no');
  }

  async function handleSubmit() {
    setLoadingSubmit(true);

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

    if (hasErr) return setLoadingSubmit(false);

    const speakerIDs: string[] = speakers.map((speaker) => speaker['_id']);
    const speakerEmails: string[] = speakers.map((speaker) => speaker['email']);

    const API_DATA = {
      editEvent,
      title,
      brief_description: briefDesc,
      full_description: fullDesc,
      host,
      speakers: speakerIDs,
      dateTime: eventDateTime,
      speakerEmails,
      isDev: isDev === 'yes' ? true : false,
    };
    const { data: infoData } = await makeRequest(
      'POST',
      '/api/webinar/createEvent',
      API_DATA
    );

    if (infoData['success'] !== 1) {
      setLoadingSubmit(false);
      setTopMessage('f: There was an error creating the webinar.');
      return;
    }

    const eventID = infoData['content']['webinar']['_id'];
    const { data: eventImageData } = await makeRequest(
      'POST',
      '/api/webinar/uploadEventImage',
      { eventID, eventImage: eventImage === editImage ? undefined : eventImage }
    );
    const { data: eventBannerData } = await makeRequest(
      'POST',
      '/api/webinar/uploadEventBanner',
      { eventID, eventBanner: eventBanner === editBanner ? undefined : eventBanner }
    );

    if (eventImageData['success'] === 1 && eventBannerData['success'] === 1) {
      setTopMessage(`s: ${infoData['message']}`);
      editClientEvents();
      resetData();
    } else setTopMessage('f: There was an error adding images to the webinar.');
    setLoadingSubmit(false);
  }

  async function handleDelete() {
    if (
      !window.confirm(
        'Are you sure you want to delete this event? This action is irreversible.'
      )
    )
      return;
    const { data } = await makeRequest('DELETE', `/api/webinar/event/${editEvent}`);

    if (data['success'] === 1) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== editEvent)
      );
      resetData();
      setTopMessage('s: The event was deleted.');
    } else setTopMessage('f: There was an error deleting the event.');
  }

  async function handleResendEmails() {
    if (
      !window.confirm(
        'Are you sure you want to resend an email invite to all speakers and host?\n\nREMINDER: They would have received an email at least once when they were first added as a speaker'
      )
    )
      return;

    const webinarData = {
      _id: editEvent,
      title,
      brief_description: briefDesc,
      full_description: fullDesc,
      dateTime: eventDateTime,
    };
    let speakerEmails: string[] = speakers.map((speaker) => speaker['email']);
    speakerEmails = speakerEmails.includes((host as HostType).email)
      ? speakerEmails
      : speakerEmails.concat((host as HostType).email);

    const { data } = await makeRequest('POST', '/api/webinar/resendSpeakerInvites', {
      webinarData,
      speakerEmails,
    });

    if (data.success === 1) setTopMessage(`s: ${data['message']}`);
    else setTopMessage(`f: ${data['message']}`);
  }

  function editClientEvents() {
    if (editEvent === '') fetchEvents();
    else
      setEvents((prevEvents) => {
        let newEvents = prevEvents.slice();
        newEvents.forEach((event) => {
          if (event._id === editEvent) {
            event.title = title;
            event.brief_description = briefDesc;
            event.full_description = fullDesc;
            event.host = host as HostType;
            event.speakers = speakers;
            event.dateTime = eventDateTime;
            event.eventImage = eventImage || '';
            event.eventBanner = eventBanner || '';
          }
        });

        return prevEvents;
      });
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
    setIsDev('no');
    setIsPrivate('no');
    setEventImage('');
    setEventBanner('');
  }

  function removeSpeaker(index: number) {
    const newSpeakers = [...speakers];
    newSpeakers.splice(index, 1);
    setSpeakers(newSpeakers);
  }

  function renderHost() {
    const currHost = host as HostType;
    return (
      <div className={styles.singleSpeaker}>
        <RSText type="subhead" className={styles.speakerName} size={14}>
          {`${currHost.firstName} ${currHost.lastName}`}
        </RSText>
        <RSText type="subhead" italic size={11}>
          {currHost.email}
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

  function renderInvalid() {
    return (
      <RSText type="subhead" size={32} bold>
        Permission not granted to view page
      </RSText>
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

  function renderPrivateSelect() {
    return (
      <>
        <FormControl className={styles.privateSelect} variant="outlined">
          <InputLabel>Private</InputLabel>
          <Select value={isPrivate} onChange={handlePrivateChange}>
            <MenuItem value={'yes'}>Yes</MenuItem>
            <MenuItem value={'no'}>No</MenuItem>
          </Select>
        </FormControl>
      </>
    );
  }

  function renderDevSelect() {
    return (
      <>
        <FormControl className={styles.privateSelect} variant="outlined">
          <InputLabel>Dev</InputLabel>
          <Select value={isDev} onChange={handleIsDevChange}>
            <MenuItem value={'yes'}>Yes</MenuItem>
            <MenuItem value={'no'}>No</MenuItem>
          </Select>
        </FormControl>
      </>
    );
  }

  function renderTextInputs() {
    const currHost = host as HostType;
    return (
      <div style={{ width: 400 }}>
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
          value={currHost.firstName}
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: 20,
          }}
        >
          <div>
            <RSText type="subhead" bold className={styles.textFieldTitle}>
              Dev
            </RSText>
            {renderDevSelect()}
          </div>
          {/* TODO - If private, open up community select autocomplete, similar to speakers */}
          <div style={{ marginLeft: 40 }}>
            <RSText type="subhead" bold className={styles.textFieldTitle}>
              Private
            </RSText>
            {renderPrivateSelect()}
          </div>
        </div>
      </div>
    );
  }

  function renderImageInputs() {
    return (
      <div className={styles.imageWrapper}>
        <div className={styles.imageSection}>
          <Button onClick={handleEventImageClicked}>Update Event Image</Button>
          <input
            type="file"
            ref={eventImageUploader}
            style={{ display: 'none' }}
            accept="image/x-png, image/jpeg"
            onChange={handleEventImageUpload}
          />
          {eventImage && (
            <div className={styles.imagePreviewWrapper}>
              <IconButton
                style={{ display: 'float', float: 'right' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove this image?'))
                    setEventImage('');
                }}
              >
                <RSText color={colors.secondaryText} size={16} bold>
                  X
                </RSText>
              </IconButton>
              <img src={eventImage} className={styles.uploadedImage} />
            </div>
          )}
        </div>

        <div className={styles.imageSection}>
          <Button onClick={handleEventBannerClicked}>Update Event Banner</Button>
          <input
            type="file"
            ref={eventBannerUploader}
            style={{ display: 'none' }}
            accept="image/x-png, image/jpeg"
            onChange={handleEventBannerUpload}
          />
          {eventBanner && (
            <div className={styles.imagePreviewWrapper}>
              <IconButton
                style={{ display: 'float', float: 'right' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove this image?'))
                    setEventBanner('');
                }}
              >
                <RSText color={colors.secondaryText} size={16} bold>
                  X
                </RSText>
              </IconButton>
              <img src={eventBanner} className={styles.uploadedImage} />
            </div>
          )}
        </div>
      </div>
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
            <RSText size={18} color="red">
              Cancel Update
            </RSText>
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
        <div style={{ display: 'flex' }}>
          {renderTextInputs()}
          {renderImageInputs()}
        </div>
        <div className={styles.buttonWrapper}>
          <Button
            variant="contained"
            className={loadingSubmit ? styles.loadingGray : styles.submitButton}
            onClick={handleSubmit}
            disabled={loadingSubmit}
          >
            {editEvent === '' ? 'CREATE' : 'UPDATE'}
          </Button>
          {editEvent && (
            <Button
              variant="contained"
              className={loadingSubmit ? styles.loadingGray : styles.emailButton}
              onClick={handleResendEmails}
              disabled={loadingSubmit}
            >
              Resend Event Invites
            </Button>
          )}
          {editEvent && (
            <Button
              variant="contained"
              className={loadingSubmit ? styles.loadingGray : styles.deleteButton}
              onClick={handleDelete}
              disabled={loadingSubmit}
            >
              DELETE
            </Button>
          )}
        </div>
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
        <div className={styles.holder}>
          {renderContent()}
          <AdminEventList events={events} handleEdit={startEditing} />
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(AdminEventCreator);
