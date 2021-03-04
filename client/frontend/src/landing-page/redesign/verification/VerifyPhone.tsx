import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ReactCodeInput from 'react-verification-code-input';

import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { putResendPhoneVerification, putVerifyPhone } from '../../../api';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { dispatchSnackbar, setRegistrationVerified } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

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

  const { registration, accessToken } = useSelector(
    (state: RootshareReduxState) => ({
      registration: state.registration,
      accessToken: state.accessToken,
    })
  );

  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(false);

  useEffect(() => {
    if (Boolean(accessToken)) history.push('/home');
    else if (!registration) history.push('/');
  }, [registration, accessToken]);

  const handleSubmit = async (code: string) => {
    setServerErr(false);
    setLoading(true);
    const data = await putVerifyPhone({
      code,
      email: registration!.email as string,
    });
    setLoading(false);
    if (data.success === 1) {
      dispatch(setRegistrationVerified());
      history.push('/account/select');
    } else {
      setServerErr(true);
    }
  };

  const resendCode = async () => {
    const data = await putResendPhoneVerification({
      email: registration!.email as string,
      phoneNumber: registration!.phoneNumber as string,
    });
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
