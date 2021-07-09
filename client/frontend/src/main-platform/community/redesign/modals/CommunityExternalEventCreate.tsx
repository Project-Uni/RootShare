import React, { useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import {
  RSButton,
  RSModal,
  RSSelect,
  RSTextField,
} from '../../../reusable-components';
import { useForm } from '../../../../helpers/hooks';
import { RSText } from '../../../../base-components';
import { FormHelperText } from '@material-ui/core';
import {
  DatePicker,
  MuiPickersUtilsProvider,
  TimePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {
  IPostCreateExternalEventResponse,
  postCreateExternalEvent,
} from '../../../../api';
import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../../../redux/actions';
import Theme from '../../../../theme/Theme';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    width: 650,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  field: {
    width: 250,
  },
}));

export enum PrivacyEnum {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

type ICreateEventForm = {
  title: string;
  type: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  streamLink: string;
  donationLink: string;
  privacy: PrivacyEnum;
};

const initialFormData: ICreateEventForm = {
  title: '',
  type: 'showcase',
  description: '',
  date: new Date(Date.now()).toUTCString(),
  startTime: new Date(Date.now()).toUTCString(),
  endTime: new Date(Date.now()).toUTCString(),
  streamLink: '',
  donationLink: '',
  privacy: PrivacyEnum.PUBLIC,
};

type Props = {
  open: boolean;
  onClose: () => void;
  communityID: string;
  onSuccess?: (event: IPostCreateExternalEventResponse['event']) => void;
};

export const CommunityExternalEventCreate = (props: Props) => {
  const styles = useStyles();

  const { open, communityID, onClose, onSuccess } = props;

  const dispatch = useDispatch();

  const {
    formFields,
    formErrors,
    handleChange,
    handleDateChange,
    updateFields,
    updateErrors,
    resetForm,
  } = useForm<ICreateEventForm>(initialFormData);

  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const onSubmit = async () => {
    setLoading(true);

    if (validate(formFields, updateErrors)) {
      const { date, startTime, endTime, ...rest } = formFields;

      const formattedStartDate = new Date(date);
      const formattedEndDate = new Date(date);
      const startData = new Date(startTime);
      const endData = new Date(endTime);

      formattedStartDate.setHours(startData.getHours());
      formattedStartDate.setMinutes(startData.getMinutes());

      formattedEndDate.setHours(endData.getHours());
      formattedEndDate.setMinutes(endData.getMinutes());

      const data = await postCreateExternalEvent({
        ...rest,
        communityID,
        startTime: formattedStartDate.toUTCString(),
        endTime: formattedEndDate.toUTCString(),
        isDev: true,
        image: '',
      });

      if (data.successful) {
        onSuccess?.(data.content.event);
        onClose();
        dispatch(
          dispatchSnackbar({
            message: 'Successfully created event.',
            mode: 'success',
          })
        );
      } else {
        setServerErr(data.message);
      }
    }
    setLoading(false);
  };

  return (
    <RSModal
      open={open}
      onClose={onClose}
      title="Event Creation"
      className={styles.wrapper}
    >
      <div
        id="banner"
        style={{
          background: 'lightgray',
          marginLeft: 30,
          marginRight: 30,
          height: 150,
          flex: 1,
          marginTop: 15,
          borderRadius: 10,
        }}
      ></div>
      <div
        style={{
          paddingLeft: 45,
          paddingRight: 45,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        {serverErr && (
          <RSText color={Theme.error} style={{ marginTop: 8, marginBottom: 8 }}>
            {serverErr}
          </RSText>
        )}
        <div className={styles.row}>
          <div>
            <RSText bold style={{ marginBottom: 10 }}>
              Event Title
            </RSText>
            <RSTextField
              placeholder="Enter event title"
              value={formFields.title}
              onChange={handleChange('title')}
              variant="standard"
              className={styles.field}
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
          </div>
          <div>
            <RSText bold>Event Type</RSText>
            <RSSelect
              onChange={handleChange('type')}
              options={[{ label: 'Showcase', value: 'showcase' }]}
              label=""
              className={styles.field}
              fontSize={14}
              value={formFields.type}
              error={!!formErrors.type}
              helperText={formErrors.type}
            />
          </div>
        </div>
        <div className={styles.row} style={{ marginTop: 15 }}>
          <div>
            <FormHelperText className={styles.field}>
              <RSText bold>Date</RSText>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  name="eventTime"
                  margin="normal"
                  format="MM/dd/yyyy"
                  value={formFields.date}
                  onChange={(date) =>
                    handleDateChange('date')(new Date(date as Date))
                  }
                  minDate={new Date(Date.now())}
                  minDateMessage={'Event Must Be in the future'}
                  className={styles.field}
                  key="datePicker"
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                />
              </MuiPickersUtilsProvider>
            </FormHelperText>
          </div>
          <div>
            <FormHelperText className={styles.field}>
              <RSText bold>Start / End Time</RSText>
              <div>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <TimePicker
                    name="eventTime"
                    margin="normal"
                    value={formFields.startTime}
                    onChange={(date) =>
                      handleDateChange('startTime')(new Date(date as Date))
                    }
                    style={{ width: 75 }}
                    key="datePicker"
                    error={!!formErrors.startTime}
                    helperText={formErrors.startTime}
                  />
                </MuiPickersUtilsProvider>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <TimePicker
                    name="eventTime"
                    margin="normal"
                    value={formFields.endTime}
                    onChange={(date) =>
                      handleDateChange('endTime')(new Date(date as Date))
                    }
                    style={{ width: 75, marginLeft: 15 }}
                    key="datePicker"
                    error={!!formErrors.endTime}
                    helperText={formErrors.endTime}
                  />
                </MuiPickersUtilsProvider>
              </div>
            </FormHelperText>
          </div>
        </div>
        <div className={styles.row} style={{ marginTop: 15 }}>
          <div>
            <RSText bold style={{ marginBottom: 10 }}>
              Stream Link
            </RSText>
            <RSTextField
              className={styles.field}
              placeholder="Enter Link"
              value={formFields.streamLink}
              onChange={handleChange('streamLink')}
              variant="standard"
              error={!!formErrors.streamLink}
              helperText={formErrors.streamLink}
            />
          </div>
          <div>
            <RSText bold style={{ marginBottom: 10 }}>
              Donation Link
            </RSText>
            <RSTextField
              className={styles.field}
              placeholder="Enter Link"
              value={formFields.donationLink}
              onChange={handleChange('donationLink')}
              variant="standard"
              error={!!formErrors.donationLink}
              helperText={formErrors.donationLink}
            />
          </div>
        </div>
        <div style={{ marginTop: 15, flex: 1 }}>
          <RSText bold style={{ marginBottom: 10 }}>
            Enter Description
          </RSText>
          <RSTextField
            style={{ width: '100%' }}
            placeholder="Description"
            value={formFields.description}
            onChange={handleChange('description')}
            variant="standard"
            error={!!formErrors.description}
            helperText={formErrors.description}
          />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginRight: 30,
          marginTop: 30,
          marginBottom: 30,
        }}
      >
        <div style={{ marginLeft: 45 }}>
          <RSText bold>Privacy</RSText>
          <RSSelect
            onChange={handleChange('privacy')}
            options={[
              { label: 'Public', value: PrivacyEnum.PUBLIC },
              { label: 'Private', value: PrivacyEnum.PRIVATE },
            ]}
            label=""
            fontSize={14}
            value={formFields.privacy}
            style={{ width: 125 }}
            error={!!formErrors.privacy}
            helperText={formErrors.privacy}
          />
        </div>
        <RSButton
          onClick={onSubmit}
          style={{ height: 50 }}
          disabled={loading}
          loading={loading}
        >
          Publish
        </RSButton>
      </div>
    </RSModal>
  );
};

const validate = (
  formFields: ICreateEventForm,
  updateErrors: (
    fields: {
      key: keyof ICreateEventForm;
      value: string;
    }[]
  ) => void
): boolean => {
  let isClean = true;
  const errUpdates: { key: keyof ICreateEventForm; value: string }[] = [];

  if (formFields.title.length === 0) {
    isClean = false;
    errUpdates.push({ key: 'title', value: 'Title is required' });
  } else {
    errUpdates.push({ key: 'title', value: '' });
  }

  if (formFields.description.length === 0) {
    isClean = false;
    errUpdates.push({ key: 'description', value: 'Description is required' });
  } else {
    errUpdates.push({ key: 'description', value: '' });
  }

  const compareDate = new Date();
  compareDate.setHours(0, 0, 0);

  if (new Date(formFields.date) < compareDate) {
    isClean = false;
    errUpdates.push({ key: 'date', value: 'Date must be in the future' });
  } else {
    errUpdates.push({ key: 'date', value: '' });
  }

  if (new Date(formFields.endTime) < new Date(formFields.startTime)) {
    isClean = false;
    errUpdates.push({ key: 'endTime', value: 'End time must be after start time' });
  } else {
    errUpdates.push({ key: 'endTime', value: '' });
  }

  updateErrors(errUpdates);

  return isClean;
};
