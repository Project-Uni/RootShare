import React, { useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import {
  RSButton,
  RSButtonV2,
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
import { postCreateExternalEvent } from '../../../../api';

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

type Props = {
  open: boolean;
  onClose: () => void;
  communityID: string;
  onSuccess?: () => void;
};

export enum Privacy {
  PUBLIC,
  PRIVATE,
}

type ICreateEventForm = {
  title: string;
  type: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  streamLink: string;
  donationLink: string;
  privacy: Privacy;
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
  privacy: Privacy.PUBLIC,
};

export const CommunityExternalEventCreate = (props: Props) => {
  const styles = useStyles();

  const { open, communityID, onClose, onSuccess } = props;

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

  const onSubmit = async () => {
    console.log('FormFields:', formFields);
    const data = await postCreateExternalEvent({
      ...formFields,
      communityID,
    } as any);
    console.log('Data:', data);
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
                  minDateMessage={'Event Must Be on January 17th after today'}
                  className={styles.field}
                  key="datePicker"
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
                    format="h:MM a"
                    value={formFields.startTime}
                    onChange={(date) =>
                      handleDateChange('startTime')(new Date(date as Date))
                    }
                    style={{ width: 75 }}
                    key="datePicker"
                  />
                </MuiPickersUtilsProvider>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <TimePicker
                    name="eventTime"
                    margin="normal"
                    format="h:MM a"
                    value={formFields.endTime}
                    onChange={(date) =>
                      handleDateChange('endTime')(new Date(date as Date))
                    }
                    style={{ width: 75, marginLeft: 15 }}
                    key="datePicker"
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
              { label: 'Public', value: Privacy.PUBLIC },
              { label: 'Private', value: Privacy.PRIVATE },
            ]}
            label=""
            fontSize={14}
            value={formFields.privacy}
            style={{ width: 125 }}
          />
        </div>
        <RSButton onClick={onSubmit} style={{ height: 50 }}>
          Publish
        </RSButton>
      </div>
    </RSModal>
  );
};
