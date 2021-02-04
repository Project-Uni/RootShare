import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import { BsPeopleFill } from 'react-icons/bs';

import { useForm } from '../../../../../helpers/hooks';

import theme from '../../../../../theme/Theme';

import { makeRequest, slideLeft } from '../../../../../helpers/functions';
import { RSModal } from '../../../../reusable-components';
import { SearchOption } from '../../../../reusable-components/components/SearchField';

import ManageSpeakersSnackbar from '../../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import MeetTheGreekForm from './MeetTheGreekForm';
import MeetTheGreeksBannerUpload from './MeetTheGreeksBannerUpload';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  loadingIndicator: {
    color: theme.primary,
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

export type EventInformationServiceResponse = {
  mtgEvent: {
    _id: string;
    title?: string;
    description: string;
    introVideoURL: string;
    speakers: Member[];
    host: string;
    dateTime: any;
    eventBanner: string;
  };
};

const defaultDate = new Date('01/17/2021 @ 4:00 PM');

const defaultFormData: IFormData = {
  description: '',
  introVideoURL: '',
  eventTime: defaultDate,
  speakers: [],
};

/* Keeping this here for now, this is how to generate a type based on existing variable - I've been looking for this solution for a long time
 *
 * type IFormData = {
 *  [key in keyof typeof defaultFormData]: typeof defaultFormData[key];
 * };
 *
 */

function MeetTheGreeksModal(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [serverErr, setServerErr] = useState<string>();

  const [renderStage, setRenderStage] = useState<0 | 1>(0);

  const [communityMembers, setCommunityMembers] = useState<SearchOption[]>([]);

  const [imageSrc, setImageSrc] = useState<string>();

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
  } = useForm(defaultFormData);

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
          type: 'user',
        }))
      );
    }
  }, [props.communityID]);

  const resetData = useCallback(() => {
    resetForm();
    setServerErr(undefined);
  }, []);

  const validateInputs = useCallback(() => {
    let hasErr = false;
    const errUpdates: { key: keyof IFormData; value: string }[] = [];
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
      formFields.introVideoURL.trim().length !== 0 &&
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
    //Handling case where user is sticking with the existing image
    if (imageSrc?.startsWith('https://')) {
      setTransition(() => slideLeft);
      setSnackbarMode('notify');
      setImageSrc('');
      onClose();
      return;
    }

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
          "Create or Edit your Fraternity's information for Meet the Greeks"
        }
        helperIcon={<BsPeopleFill size={90} />}
        serverErr={serverErr}
      >
        <div>
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
            <MeetTheGreeksBannerUpload
              setServerErr={setServerErr}
              onUpload={onUploadBanner}
              loading={apiLoading}
              imageSrc={imageSrc}
              updateImageSrc={setImageSrc}
            />
          )}
        </div>
      </RSModal>
    </>
  );
}

export default MeetTheGreeksModal;
