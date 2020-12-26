import React, { ChangeEvent, useCallback } from 'react';
import {
  CircularProgress,
  TextField,
  Button,
  FormHelperText,
  makeStyles,
} from '@material-ui/core';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import theme from '../../../../theme/Theme';
import { colors } from '../../../../theme/Colors';

import { UserSearch } from '../../../reusable-components';
import { SearchOption } from '../../../reusable-components/components/UserSearch';
import { RSText } from '../../../../base-components';
import MeetTheGreeksSpeakers from './MeetTheGreeksSpeakers';

import { IFormData, IFormErrors } from './MeetTheGreeksModal';

const useStyles = makeStyles((_: any) => ({
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
}));

type Props = {
  loading?: boolean;
  formFields: IFormData;
  formErrors: IFormErrors;
  handleChange: (key: keyof IFormData) => (e: ChangeEvent<HTMLInputElement>) => void;
  handleDateChange: (key: keyof IFormData) => (date: Date) => void;
  updateFields: (
    fields: {
      key: keyof IFormData;
      value: any;
    }[]
  ) => void;
  communityMembers: SearchOption[];
  onSubmit: () => any;
};

function MeetTheGreekForm(props: Props) {
  const styles = useStyles();
  const {
    formFields,
    formErrors,
    handleChange,
    handleDateChange,
    updateFields,
    loading,
    communityMembers,
    onSubmit,
  } = props;

  const onAutocomplete = (user: SearchOption) => {
    if (
      !formFields.speakers.find((member) => member._id === user._id) &&
      formFields.speakers.length < 4
    )
      updateFields([{ key: 'speakers', value: [...formFields.speakers, user] }]);
  };

  const removeSpeaker = useCallback(
    (idx: number) => {
      if (window.confirm('Are you sure you want to remove the speaker?')) {
        const arr = [...formFields.speakers];
        arr.splice(idx, 1);
        updateFields([{ key: 'speakers', value: arr }]);
      }
    },
    [formFields.speakers]
  );

  return (
    <form style={{ marginLeft: 20, marginRight: 20 }}>
      <RSText type="body" bold size={12} className={styles.fieldLabel}>
        Event Description
      </RSText>

      <TextField
        name="description"
        value={formFields.description}
        onChange={handleChange('description')}
        variant="outlined"
        label="Description"
        key="desc"
        className={styles.textField}
        multiline
        rows={3}
        autoComplete="off"
        required
        helperText={formErrors.description}
        error={formErrors.description !== ''}
      />

      <RSText type="body" bold size={12} className={styles.fieldLabel}>
        Introduction Video YouTube URL
      </RSText>
      <TextField
        name="introVideoURL"
        value={formFields.introVideoURL}
        onChange={handleChange('introVideoURL')}
        variant="outlined"
        label="YouTube URL"
        key="introURL"
        className={styles.textField}
        autoComplete="off"
        required
        helperText={formErrors.introVideoURL}
        error={formErrors.introVideoURL !== ''}
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
            value={formFields.eventTime}
            onChange={(date) =>
              handleDateChange('eventTime')(new Date(date as Date))
            }
            minDate={new Date('January 17, 2021')}
            minDateMessage={'Event Must Be on January 17th'}
            maxDate={new Date('January 19, 2021')}
            maxDateMessage={'Event Must be before January 19th'}
            className={styles.dateBox}
            key="datePicker"
          />
        </MuiPickersUtilsProvider>
      </FormHelperText>
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
        key="userSearch"
        error={formErrors.speakers}
      />
      <MeetTheGreeksSpeakers
        speakers={formFields.speakers}
        removeSpeaker={removeSpeaker}
      />
      <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
        <Button
          className={[
            styles.middleButton,
            loading ? styles.disabledButton : styles.primaryButton,
          ].join(' ')}
          disabled={loading}
          onClick={onSubmit}
        >
          {loading ? <CircularProgress size={30} /> : 'Next'}
        </Button>
      </div>
    </form>
  );
}

export default MeetTheGreekForm;
