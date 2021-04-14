import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import { Redirect, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import {
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
  Button,
  TextField,
} from '@material-ui/core';

import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/functions';

import HypeHeader from '../headerFooter/HypeHeader';
import HypeFooter from '../headerFooter/HypeFooter';
import HypeCard from '../hype-card/HypeCard';
import UniversityAutocomplete from '../hype-registration/UniversityAutocomplete';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  tabDesc: {
    fontSize: '12pt',
    margin: '0px',
    fontWeight: 'bold',
    fontfamily: 'Ubuntu',
    textAlign: 'left',
    marginLeft: '25px',
    marginTop: '20px',
  },
  autocompleteDiv: {
    marginLeft: '25px',
    marginTop: '20px',
  },
  universityStanding: {
    fontSize: '12pt',
    margin: '0px',
    fontWeight: 'bold',
    fontfamily: 'Ubuntu',
    textAlign: 'left',
    marginLeft: '25px',
    marginTop: -15,
  },
  selectDiv: {
    display: 'flex',
    justifyContent: 'left',
    marginLeft: '25px',
  },
  statusField: {
    width: '200px',
    marginTop: '20px',
    marginBottom: '20px',
  },
  passwordDesc: {
    fontSize: '13pt',
    margin: '0px',
    fontWeight: 'bold',
    fontfamily: 'Ubuntu',
    textAlign: 'left',
    marginLeft: '25px',
    marginTop: '15px',
    paddingTop: 10,
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: 'gray',
  },
  textField: {
    width: '325px',
    marginTop: '20px',
    marginBottom: '10px',
  },
  buttonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginLeft: '20px',
    marginRight: '20px',
  },
}));

type Props = {
  location: any;

  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

function HypeExternalMissingInfo(props: Props) {
  const styles = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [landingRedirect, setLandingRedirect] = useState(false);
  const [additionalRedirect, setAdditionalRedirect] = useState(false);

  const [university, setUniversity] = useState('Purdue University');
  const [standing, setStanding] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [universityErr, setUniversityErr] = useState('');
  const [standingErr, setStandingErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [confirmErr, setConfirmErr] = useState('');

  const values = queryString.parse(props.location.search);
  const accessToken = values.accessToken as string;
  const refreshToken = values.refreshToken as string;

  async function checkCompletedRegistration() {
    const { data } = await makeRequest('POST', '/auth/getRegistrationInfo');
    if (data['success'] === 1) {
      if (data['content']['externalComplete']) setAdditionalRedirect(true);
    } else setLandingRedirect(true);
  }

  async function checkAuth() {
    if (Boolean(accessToken)) {
      // props.updateUser({ ...data['content'] });
      props.updateAccessToken(accessToken);
      props.updateRefreshToken(refreshToken);
      checkCompletedRegistration();
    } else setLandingRedirect(true);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  function handleUniversityChange(event: any) {
    setUniversity(event.target.value);
  }

  function handleUniversityAutocompleteChange(_: any, newValue: any) {
    if (newValue === null) {
      setUniversity('');
    } else setUniversity(newValue);
  }

  function handleStandingChange(event: any) {
    setStanding(event.target.value);
  }

  function handlePasswordChange(event: any) {
    setPassword(event.target.value);
  }

  function handleConfirmPasswordChange(event: any) {
    setConfirmPassword(event.target.value);
  }

  async function handleSubmit() {
    setLoading(true);
    let hasErr = false;

    if (standing.length === 0) {
      setStandingErr('Standing is required');
      hasErr = true;
    } else setStandingErr('');

    if (university.length === 0) {
      setUniversityErr('University is required');
      hasErr = true;
    } else setUniversityErr('');

    if (password.length > 0 && password.length < 8) {
      setPasswordErr('Password must be at least 8 characters');
      hasErr = true;
    } else setPasswordErr('');

    if (confirmPassword !== password) {
      setConfirmErr('Passwords must match');
      hasErr = true;
    } else setConfirmErr('');

    if (hasErr) {
      setLoading(false);
      return;
    }
    const { data } = await makeRequest(
      'POST',
      '/auth/complete-registration/required',
      {
        university: university,
        accountType: standing,
        password,
      }
    );

    setLoading(false);
    if (data.success === 1) {
      props.updateAccessToken(data.content.accessToken);
      props.updateRefreshToken(data.content.refreshToken);
      history.push('/register/initialize');
    }
  }

  function renderUniversityStandingSelect() {
    return (
      <>
        <p className={styles.universityStanding}>University Standing:</p>
        <div className={styles.selectDiv}>
          <FormControl
            variant="outlined"
            className={styles.statusField}
            error={standingErr !== ''}
          >
            <InputLabel>Standing</InputLabel>
            <Select value={standing} onChange={handleStandingChange} label="Age">
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="alumni">Alumni</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
              <MenuItem value="recruiter">Recruiter</MenuItem>
            </Select>
            <FormHelperText>{standingErr}</FormHelperText>
          </FormControl>
        </div>
      </>
    );
  }

  function renderIntenalPasswordInputs() {
    return (
      <div>
        <p className={styles.passwordDesc}>
          Optionally set a password for logging in with RootShare
        </p>
        <p className={styles.tabDesc}>Password:</p>
        <TextField
          label="Password"
          variant="outlined"
          className={styles.textField}
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={passwordErr !== ''}
          helperText={passwordErr}
          autoComplete="new-password"
        />

        <p className={styles.tabDesc}>Confirm Password:</p>
        <TextField
          label="Confirm"
          variant="outlined"
          className={styles.textField}
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={confirmErr !== ''}
          helperText={confirmErr}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {landingRedirect && <Redirect to="/" />}
      {additionalRedirect && <Redirect to="/register/initialize" />}
      <HypeHeader />
      <div className={styles.body}>
        <HypeCard headerText="We need some more info" width={400} loading={loading}>
          <p className={styles.tabDesc}>University:</p>
          <div className={styles.autocompleteDiv}>
            <UniversityAutocomplete
              value={university}
              handleQueryChange={handleUniversityChange}
              handleAutoCompleteChange={handleUniversityAutocompleteChange}
              universityErr={universityErr}
            />
          </div>
          {renderUniversityStandingSelect()}
          {renderIntenalPasswordInputs()}
          <div className={styles.buttonDiv}>
            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={handleSubmit}
            >
              Next
            </Button>
          </div>
        </HypeCard>
      </div>
      <HypeFooter />
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
    updateAccessToken: (accessToken: string) => {
      dispatch(updateAccessToken(accessToken));
    },
    updateRefreshToken: (refreshToken: string) => {
      dispatch(updateRefreshToken(refreshToken));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HypeExternalMissingInfo);
