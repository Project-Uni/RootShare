import React, { useState, useEffect, useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  TextField,
  Button,
  FormHelperText,
  Avatar,
  IconButton,
} from '@material-ui/core';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { BsPeopleFill, BsPlusCircle } from 'react-icons/bs';

import theme from '../../../../theme/Theme';
import { colors } from '../../../../theme/Colors';

import { RSModal, UserSearch } from '../../../reusable-components';
import { SearchOption } from '../../../reusable-components/components/UserSearch';
import { RSText } from '../../../../base-components';
import { makeRequest, slideLeft } from '../../../../helpers/functions';

import { useForm } from 'react-hook-form';

import { TransitionProps } from '@material-ui/core/transitions';
import ManageSpeakersSnackbar from '../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  loadingIndicator: {
    color: theme.primary,
  },
  textField: {
    width: 460,
  },
  fieldLabel: {
    textAlign: 'left',
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 8,
  },
  primaryButton: {
    background: theme.bright,
    color: theme.altText,
    '&:hover': {
      background: colors.ternary,
    },
  },
  disabledButton: { background: theme.disabledButton },
  secondaryButton: {
    background: theme.disabledButton,
    color: theme.altText,
    '&:hover': {
      background: colors.ternary,
    },
  },
  middleButton: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: 300,
  },
  dateBox: {
    width: 250,
    marginLeft: 2,
  },
  speakerLabel: {
    marginLeft: 15,
  },
  hostLabel: {
    marginLeft: 10,
  },
  sideButtons: {
    width: 150,
    paddingTop: 8,
    paddingBottom: 8,
    marginLeft: 10,
    marginRight: 10,
  },
  serverError: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  imageUploadBox: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  stageTwoHead: {
    marginTop: 10,
  },
}));

type Props = {
  open: boolean;
  onClose: () => any;
  communityName: string;
  communityID: string;
};

type IFormData = {
  description: string;
  introVideoURL: string;
  eventTime: any;
};

type ServiceResponse = {
  members: {
    [key: string]: any;
    firstName: string;
    lastName: string;
    email: string;
    _id: string;
    profilePicture?: string;
  }[];
};

// https://dev.to/finallynero/react-form-using-formik-material-ui-and-yup-2e8h

function MeetTheGreeksModal(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const [renderStage, setRenderStage] = useState<0 | 1>(1);

  const defaultDate = new Date('01/17/2021 @ 4:00 PM');
  const [definedDate, setDefinedDate] = useState<any>(defaultDate);
  const [speakers, setSpeakers] = useState<SearchOption[]>([]);

  const [communityMembers, setCommunityMembers] = useState<SearchOption[]>([]);

  const [imageSrc, setImageSrc] = useState<string>();
  const fileUploader = useRef<HTMLInputElement>(null);

  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);
  const [transition, setTransition] = useState<any>();

  const { register, handleSubmit, control } = useForm<IFormData>({
    defaultValues: {
      description: '',
      introVideoURL: '', //Need to handle date separately
    },
  });

  useEffect(() => {
    if (props.open) {
      setLoading(true);
      fetchCurrentEventInformation().then(() =>
        fetchCommunityMembers().then(() => setLoading(false))
      );
    }
  }, [props.open]);

  async function fetchCurrentEventInformation() {
    return true;
  }

  async function fetchCommunityMembers() {
    const { data } = await makeRequest<ServiceResponse>(
      'GET',
      `/api/community/${props.communityID}/members?skipCalculation=true`
    );
    if (data.success === 1) {
      setCommunityMembers(
        data.content.members.map((member) => ({
          _id: member._id,
          label: `${member.firstName} ${member.lastName}`,
          value: `${member.firstName} ${member.lastName} ${member._id} ${member.email}`,
          profilePicture: member.profilePicture,
        }))
      );
    }
  }

  const onAutocomplete = (user: SearchOption) => {
    if (!speakers.find((member) => member._id === user._id) && speakers.length < 4)
      setSpeakers([...speakers, user]);
  };

  const resetData = () => {
    setDefinedDate(defaultDate);
    setSpeakers([]);
    setServerErr('');
  };

  const onUploadBanner = async () => {
    setApiLoading(true);
    const { data } = await makeRequest(
      'PUT',
      `/api/mtg/banner/${props.communityID}`,
      { image: imageSrc }
    );
    if (data.success === 1) {
      setTransition(() => slideLeft);
      setSnackbarMode('notify');
      setImageSrc('');
      props.onClose();
      setApiLoading(false);
    } else {
      setServerErr(data.message);
    }
  };

  const onSubmit = async (formData: IFormData) => {
    setApiLoading(true);
    const { data } = await makeRequest(
      'POST',
      `/api/mtg/create/${props.communityID}`,
      {
        description: formData.description,
        introVideoURL: formData.introVideoURL,
        eventTime: definedDate,
        speakers: speakers.map((speaker) => speaker._id),
      }
    );
    console.log('Data:', data);
    if (data.success === 1) {
      resetData();
      setRenderStage(1);
    } else {
      setServerErr(data.message);
    }
    setApiLoading(false);
  };

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      if (event.target.files[0].size > 1440000) {
        setServerErr('The image file is too big.');
        event.target.value = '';
        return;
      }
      setServerErr('');
      const imageReader = new FileReader();

      imageReader.onloadend = (event: ProgressEvent) => {
        const resultBuffer = imageReader.result;
        setImageSrc(resultBuffer as string);
      };

      imageReader.readAsDataURL(event.target.files[0]);
      event.target.value = '';
    }
  }

  const removeSpeaker = useCallback(
    (idx: number) => {
      if (window.confirm('Are you sure you want to remove the speaker?')) {
        const arr = [...speakers];
        arr.splice(idx, 1);
        setSpeakers(arr);
      }
    },
    [speakers]
  );

  const EventSpeakers = () => (
    <>
      {speakers.map((speaker, idx) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar src={speaker.profilePicture} alt={speaker.label} sizes="50px" />
            <RSText size={13} bold className={styles.speakerLabel}>
              {speaker.label}
            </RSText>
            {idx === 0 && (
              <RSText
                size={12}
                italic
                color={theme.secondaryText}
                className={styles.hostLabel}
              >
                (Host)
              </RSText>
            )}
          </div>
          <IconButton onClick={() => removeSpeaker(idx)}>
            <RSText>X</RSText>
          </IconButton>
        </div>
      ))}
    </>
  );
  const EventInformation = () => {
    return (
      <form
        style={{ marginLeft: 20, marginRight: 20 }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Event Description
        </RSText>
        <TextField
          variant="outlined"
          inputRef={register}
          name="description"
          label="Description"
          key="desc"
          className={styles.textField}
          multiline
          rows={3}
          autoComplete="off"
        />
        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Introduction Video YouTube URL
        </RSText>
        <TextField
          variant="outlined"
          name="introVideoURL"
          inputRef={register}
          label="YouTube URL"
          key="introURL"
          className={styles.textField}
          autoComplete="off"
        />
        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Event Date & Time
        </RSText>
        <FormHelperText className={styles.dateBox}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker
              name="eventTime"
              margin="normal"
              format="MM/dd/yyyy @ h:mm a"
              value={definedDate}
              onChange={(value) => setDefinedDate(value)}
              minDate={new Date('January 17, 2021')}
              minDateMessage={'Event Must Be on January 17th'}
              maxDate={new Date('January 19, 2021')}
              maxDateMessage={'Event Must be before January 19th'}
              className={styles.dateBox}
            />
          </MuiPickersUtilsProvider>
        </FormHelperText>
        {/* Add Image Upload Button and Image Preview */}
        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Meet The Greeks Speakers
        </RSText>
        <UserSearch
          label="Speakers"
          className={styles.textField}
          name="speakers"
          options={communityMembers}
          onAutocomplete={onAutocomplete}
          helperText="Add up to 4 speakers for the event"
        />
        <EventSpeakers />
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
          <Button
            className={[
              styles.middleButton,
              apiLoading ? styles.disabledButton : styles.primaryButton,
            ].join(' ')}
            disabled={apiLoading}
            type="submit"
          >
            {apiLoading ? <CircularProgress size={30} /> : 'Next'}
          </Button>
        </div>
      </form>
    );
  };

  const EventBannerStage = () => (
    <div>
      <div style={{ marginLeft: 15, marginRight: 15 }}>
        <RSText type="head" bold size={14} className={styles.stageTwoHead}>
          Upload Event Banner
        </RSText>
        {imageSrc ? (
          <div
            className={styles.imageUploadBox}
            onClick={() => fileUploader.current?.click()}
          >
            <img
              src={imageSrc}
              style={{ width: '100%', marginTop: 10, marginBottom: 10 }}
            />
          </div>
        ) : (
          <div
            className={styles.imageUploadBox}
            style={{
              height: 300, //Define based on ratio
              width: '100%',
              border: `1px dashed ${theme.secondaryText}`,
              marginTop: 10,
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => fileUploader.current?.click()}
          >
            <input
              type="file"
              ref={fileUploader}
              style={{ display: 'none' }}
              accept="image/x-png, image/jpeg"
              onChange={handleImageUpload}
            />
            <BsPlusCircle size={40} color="lightgrey" />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
        <Button
          className={[
            styles.middleButton,
            apiLoading ? styles.disabledButton : styles.primaryButton,
          ].join(' ')}
          disabled={apiLoading}
          onClick={onUploadBanner}
        >
          {apiLoading ? <CircularProgress size={30} /> : 'Finish'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <ManageSpeakersSnackbar
        message={'Successfully updated Meet The Greeks event'}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <RSModal
        open={props.open}
        title={`Meet The Greeks - ${props.communityName}`}
        onClose={props.onClose}
        className={styles.modal}
        helperText={
          "Create or Edit your Fraternity's event time and information for Meet the Greeks"
        }
        helperIcon={<BsPeopleFill size={90} />}
      >
        <div>
          {serverErr && (
            <RSText italic color={theme.error} className={styles.serverError}>
              {serverErr}
            </RSText>
          )}
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 15,
                paddingBottom: 15,
              }}
            >
              <CircularProgress size={60} className={styles.loadingIndicator} />
            </div>
          ) : renderStage === 0 ? (
            <EventInformation />
          ) : (
            <EventBannerStage />
          )}
        </div>
      </RSModal>
    </>
  );
}

export default MeetTheGreeksModal;
