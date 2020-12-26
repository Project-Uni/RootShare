import React, { useState, useEffect, useRef, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Button } from '@material-ui/core';
import { BsPeopleFill, BsPlusCircle } from 'react-icons/bs';

import theme from '../../../../theme/Theme';
import { colors } from '../../../../theme/Colors';

import { RSModal } from '../../../reusable-components';
import { SearchOption } from '../../../reusable-components/components/UserSearch';
import { RSText } from '../../../../base-components';
import { makeRequest, slideLeft } from '../../../../helpers/functions';

import ManageSpeakersSnackbar from '../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import MeetTheGreekForm from './MeetTheGreekForm';
import useForm from '../../../../hooks/useForm';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  loadingIndicator: {
    color: theme.primary,
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

export type IFormData = {
  description: string;
  introVideoURL: string;
  eventTime: any;
  speakers: SearchOption[];
};

export type IFormErrors = {
  description: string;
  introVideoURL: string;
  eventTime: string;
  speakers: string;
};

type Member = {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  profilePicture?: string;
};

type MembersServiceResponse = {
  members: {
    [key: string]: any;
    firstName: string;
    lastName: string;
    email: string;
    _id: string;
    profilePicture?: string;
  }[];
};

type EventInformationServiceResponse = {
  mtgEvent: {
    title?: string;
    description: string;
    introVideoURL: string;
    speakers: Member[];
    host: string;
    dateTime: any;
    eventBanner: string;
  };
};

// https://dev.to/finallynero/react-form-using-formik-material-ui-and-yup-2e8h

const defaultDate = new Date('01/17/2021 @ 4:00 PM');

const defaultFormData: {
  description: string;
  introVideoURL: string;
  eventTime: Date;
  speakers: SearchOption[];
} = {
  description: '',
  introVideoURL: '',
  eventTime: defaultDate,
  speakers: [],
};

function MeetTheGreeksModal(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const [renderStage, setRenderStage] = useState<0 | 1>(0);

  const [communityMembers, setCommunityMembers] = useState<SearchOption[]>([]);

  const [imageSrc, setImageSrc] = useState<string>();
  const fileUploader = useRef<HTMLInputElement>(null);

  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);
  const [transition, setTransition] = useState<any>();

  const {
    formFields,
    formErrors,
    handleChange,
    handleDateChange,
    updateFields,
    updateErrors,
    resetForm,
  } = useForm<IFormData, IFormErrors>(defaultFormData);

  useEffect(() => {
    if (props.open) {
      setLoading(true);
      fetchCurrentEventInformation().then(() =>
        fetchCommunityMembers().then(() => setLoading(false))
      );
    }
  }, [props.open]);

  const onClose = useCallback(() => {
    props.onClose();
    setRenderStage(0);
    resetData();
  }, []);

  const fetchCurrentEventInformation = useCallback(async () => {
    const { data } = await makeRequest<EventInformationServiceResponse>(
      'GET',
      `/api/mtg/event/${props.communityID}`
    );
    if (data.success === 1) {
      const { mtgEvent } = data.content;
      const fieldUpdateArgs: { key: keyof IFormData; value: any }[] = [
        { key: 'description', value: mtgEvent.description },
        { key: 'introVideoURL', value: mtgEvent.introVideoURL },
        {
          key: 'speakers',
          value: mtgEvent.speakers.map((speaker) => ({
            label: `${speaker.firstName} ${speaker.lastName}`,
            _id: speaker._id,
            value: `${speaker.firstName} ${speaker.lastName} ${speaker._id} ${speaker.email}`,
            profilePicture: speaker.profilePicture,
          })),
        },
        { key: 'eventTime', value: mtgEvent.dateTime },
      ];
      updateFields(fieldUpdateArgs);
      setImageSrc(mtgEvent.eventBanner);
    }
  }, []);

  const fetchCommunityMembers = useCallback(async () => {
    const { data } = await makeRequest<MembersServiceResponse>(
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
  }, [props.communityID]);

  const resetData = useCallback(() => {
    resetForm();
    setServerErr('');
  }, []);

  const validateInputs = useCallback(() => {
    let hasErr = false;
    const errUpdates: { key: keyof IFormErrors; value: string }[] = [];
    if (formFields.description.length < 5) {
      hasErr = true;
      errUpdates.push({
        key: 'description',
        value: 'Please enter a longer description',
      });
    } else {
      errUpdates.push({
        key: 'description',
        value: '',
      });
    }

    if (
      formFields.introVideoURL.length === 0 ||
      !formFields.introVideoURL.startsWith('https://')
    ) {
      hasErr = true;
      errUpdates.push({
        key: 'introVideoURL',
        value: 'Please enter a valid YouTube URL',
      });
    } else {
      errUpdates.push({
        key: 'introVideoURL',
        value: '',
      });
    }

    if (formFields.speakers.length === 0 || formFields.speakers.length > 4) {
      hasErr = true;
      errUpdates.push({
        key: 'speakers',
        value: '1-4 Speakers are required for the event',
      });
    } else {
      errUpdates.push({
        key: 'speakers',
        value: '',
      });
    }

    //TODO - Date Validation. Not sure if we'll need this though b/c the component looks like its handling it

    updateErrors(errUpdates);
    return hasErr;
  }, [formFields]);

  const onSubmit = useCallback(async () => {
    setApiLoading(true);
    if (validateInputs()) {
      setApiLoading(false);
      return;
    }
    const { data } = await makeRequest(
      'POST',
      `/api/mtg/update/${props.communityID}`,
      {
        description: formFields.description,
        introVideoURL: formFields.introVideoURL,
        eventTime: formFields.eventTime,
        speakers: formFields.speakers.map((speaker) => speaker._id),
      }
    );
    if (data.success === 1) {
      resetData();
      setRenderStage(1);
    } else {
      setServerErr(data.message);
    }
    setApiLoading(false);
  }, [formFields]);

  const onUploadBanner = useCallback(async () => {
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
      onClose();
    } else {
      setServerErr(data.message);
    }
    setApiLoading(false);
  }, [imageSrc]);

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
        onClose={onClose}
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
            <MeetTheGreekForm
              formFields={formFields}
              formErrors={formErrors}
              handleChange={handleChange}
              handleDateChange={handleDateChange}
              updateFields={updateFields}
              onSubmit={onSubmit}
              loading={apiLoading}
              communityMembers={communityMembers}
            />
          ) : (
            <EventBannerStage />
          )}
        </div>
      </RSModal>
    </>
  );
}

export default MeetTheGreeksModal;
