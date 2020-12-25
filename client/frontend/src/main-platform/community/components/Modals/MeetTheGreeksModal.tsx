import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  TextField,
  Button,
  FormHelperText,
} from '@material-ui/core';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import theme from '../../../../theme/Theme';
import { colors } from '../../../../theme/Colors';

import { connect } from 'react-redux';
import { RSModal } from '../../../reusable-components';
import { RSText } from '../../../../base-components';

import { useForm } from 'react-hook-form';
import { BsPeopleFill } from 'react-icons/bs';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  loadingIndicator: {
    // color: colors.primary,
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
  createButton: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: 300,
    background: theme.bright,
    color: theme.altText,
    '&:hover': {
      background: colors.ternary,
    },
  },
  disabledButton: {
    background: theme.disabledButton,
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
  open: boolean;
  onClose: () => any;
  communityName: string;
};

type IFormData = {
  description: string;
  introVideoURL: string;
  eventTime: any;
};

// https://dev.to/finallynero/react-form-using-formik-material-ui-and-yup-2e8h

function LikesModal(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [serverErr, setServerErr] = useState(false);

  const defaultDate = new Date('01/17/2021 @ 4:00 PM');
  const [definedDate, setDefinedDate] = useState<any>(defaultDate);

  const { register, handleSubmit, control } = useForm<IFormData>({
    defaultValues: {
      description: '',
      introVideoURL: '', //Need to handle date separately
      // eventTime: defaultDate,
    },
  });

  useEffect(() => {
    if (props.open) {
      setLoading(true);
      fetchData();
    }
  }, [props.open]);

  async function fetchData() {
    // const { data } = await makeRequest(
    //   'GET',
    //   `/api/posts/likes/${props.postID}`,
    //   {},
    //   true,
    //   props.accessToken,
    //   props.refreshToken
    // );
    // if (data.success === 1) {
    //   setUsers(data.content.likes);
    //   setServerErr(false);
    // } else {
    //   setServerErr(true);
    // }
    setLoading(false);
  }

  const onSubmit = (data: IFormData) => {
    console.log('Data:', data);
    console.log('Date:', definedDate);
  };

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
        />
        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Event Date & Time
        </RSText>
        <FormHelperText
          //  error={dateTimeErr !== ''}
          className={styles.dateBox}
        >
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
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
          <Button
            className={loading ? styles.disabledButton : styles.createButton}
            disabled={loading}
            type="submit"
          >
            {loading ? <CircularProgress size={30} /> : 'Next'}
          </Button>
        </div>
      </form>
    );
  };

  return (
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
        ) : serverErr ? (
          <RSText>There was an error loading the likes</RSText>
        ) : (
          <EventInformation />
        )}
      </div>
    </RSModal>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(LikesModal);
