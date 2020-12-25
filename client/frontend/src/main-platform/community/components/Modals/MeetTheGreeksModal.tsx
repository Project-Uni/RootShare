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

import { connect } from 'react-redux';
import { RSModal } from '../../../reusable-components';
import { RSText } from '../../../../base-components';
import theme from '../../../../theme/Theme';
import useForm from '../../../../hooks/useForm';

import { colors } from '../../../../theme/Colors';

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
    width: 200,
    marginLeft: 2,
    // marginRight: 20,
  },
}));

type Props = {
  open: boolean;
  onClose: () => any;
  communityName: string;
};

// https://dev.to/finallynero/react-form-using-formik-material-ui-and-yup-2e8h

function LikesModal(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [serverErr, setServerErr] = useState(false);

  const { formFields, handleChange } = useForm({
    description: '',
    introVideoURL: '',
    eventTime: '', //Needs custom handler
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

  const handleSubmit = () => {
    console.log('FormFields:', formFields);
  };

  const EventInformation = () => {
    return (
      <form style={{ marginLeft: 20, marginRight: 20 }}>
        <RSText type="body" bold size={12} className={styles.fieldLabel}>
          Event Description
        </RSText>
        <TextField
          variant="outlined"
          value={formFields.description}
          onChange={handleChange('description')}
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
          value={formFields.introVideoURL}
          onChange={handleChange('introVideoURL')}
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
          {/* <p className={styles.dateErr}>{dateTimeErr}</p> */}
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker
              margin="normal"
              format="MM/dd/yyyy @ h:mm a"
              value={Date.now()}
              onChange={() => {}}
              minDate={new Date()}
              minDateMessage={'Event Must Be on January 17th'}
              className={styles.dateBox}
            />
          </MuiPickersUtilsProvider>
        </FormHelperText>
        {/* Add Image Upload Button and Image Preview */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
          <Button
            className={loading ? styles.disabledButton : styles.createButton}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? <CircularProgress size={30} /> : 'Create'}
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
