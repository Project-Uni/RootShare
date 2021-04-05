import React, { useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { AiFillBell, AiOutlineSend } from 'react-icons/ai';

import {
  RSButton,
  RSModal,
  RSTextField,
} from '../../main-platform/reusable-components';
import Theme from '../../theme/Theme';
import { CircularProgress } from '@material-ui/core';
import { postPromoteEvent } from '../../api';
import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../redux/actions';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    maxWidth: 450,
  },
}));

type Props = {
  open: boolean;
  onClose: () => void;
  eventID: string;
};

export const AdminPromoteModal = (props: Props) => {
  const styles = useStyles();
  const { open, onClose, eventID } = props;

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) {
      setMessage('');
      setError(undefined);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Message is invalid');
    } else {
      setError(undefined);
      setLoading(true);
      const data = await postPromoteEvent({ eventID, message: message.trim() });
      if (data.success === 1) {
        onClose();
        dispatch(
          dispatchSnackbar({
            mode: 'notify',
            message: 'Successfully promoted event!',
          })
        );
      } else {
        dispatch(
          dispatchSnackbar({
            mode: 'error',
            message: 'There was an error promoting the event',
          })
        );
      }
      setLoading(false);
    }
  };

  return (
    <RSModal
      open={open}
      title="Promote Event"
      onClose={onClose}
      helperText="This will send a notification to all rootshare members about the event you want to promote. Please enter the message you want to attach with the notification. [NOTE] This action takes some time to perform, please be patient!"
      helperIcon={<AiFillBell color={Theme.secondaryText} size={50} />}
      className={styles.wrapper}
    >
      <div
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <RSTextField
          variant="outlined"
          label="Message"
          fullWidth
          style={{ marginTop: 20 }}
          multiline
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={Boolean(error)}
          helperText={error}
        />
        <RSButton
          style={{ marginTop: 20, marginBottom: 20 }}
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <CircularProgress style={{ color: Theme.altText }} />
          ) : (
            <>
              Submit
              <AiOutlineSend
                color={Theme.altText}
                size={20}
                style={{ marginLeft: 15 }}
              />
            </>
          )}
        </RSButton>
      </div>
    </RSModal>
  );
};
