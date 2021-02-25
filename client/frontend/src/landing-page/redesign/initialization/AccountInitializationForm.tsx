import React, { useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

type Props = {};

export const AccountInitializationForm = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const { accessToken, registration } = useSelector(
    (state: RootshareReduxState) => ({
      accessToken: state.accessToken,
      registration: state.registration,
    })
  );

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
    else if (
      !registration?.email ||
      !registration?.password ||
      !registration?.phoneNumber
    )
      history.push('/');
    else if (!registration?.verified) history.push('/account/verify');
    else if (!registration?.accountType) history.push('/account/select');
  }, [accessToken, registration]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className={styles.wrapper}>
      <p>AccountInitializationForm Template</p>
    </div>
  );
};
