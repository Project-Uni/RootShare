import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ReactCodeInput from 'react-verification-code-input';

import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { putResendPhoneVerification, putVerifyPhone } from '../../../api';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../../redux/actions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    maxWidth: 400,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendCode: {
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
}));

type Props = {};

export const VerifyPhone = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(false);

  const handleSubmit = async () => {
    setServerErr(false);
    setLoading(true);
    //TODO - Figure out email move, maybe unsaved redux?
    const data = await putVerifyPhone({ code, email: '' });
    setLoading(false);
    if (data.success === 1) {
      //Update redux
      history.push('/account/select');
    } else {
      setServerErr(true);
    }
  };

  const resendCode = async () => {
    const data = await putResendPhoneVerification({ email: '', phoneNumber: '' });
    if (data.success === 1)
      dispatch(
        dispatchSnackbar({
          mode: 'success',
          message: 'Successfully re-sent code!',
        })
      );
    else
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error sending the code',
        })
      );
  };

  return (
    <div className={styles.wrapper}>
      <RSText color={Theme.secondaryText} style={{ marginBottom: 25 }}>
        PLEASE ENTER CODE TO VERIFY PHONE NUMBER
      </RSText>
      <ReactCodeInput
        autoFocus
        type="number"
        fields={6}
        onChange={setCode}
        onComplete={handleSubmit}
        fieldHeight={70}
        loading={loading}
      />
      {serverErr && (
        <RSText color={Theme.error} style={{ marginTop: 5 }}>
          Incorrect Code
        </RSText>
      )}
      <RSText style={{ marginTop: 15 }}>
        Didn't receive the code?{' '}
        <span
          style={{ color: Theme.bright, fontWeight: 'bold' }}
          className={styles.resendCode}
          onClick={resendCode}
        >
          Click Here
        </span>{' '}
        to resend.
      </RSText>
    </div>
  );
};
