import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import {
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  InputLabel,
  FormControl,
  IconButton,
} from '@material-ui/core';
import { RiMessage2Line } from 'react-icons/ri';

import { BigButton, RSModal } from '../../../../reusable-components';
import RSText from '../../../../../base-components/RSText';

import { colors } from '../../../../../theme/Colors';
import { makeRequest } from '../../../../../helpers/functions';
import { SnackbarMode } from '../../../../../helpers/types';
import { ENTER_KEYCODE } from '../../../../../helpers/constants';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  richEditor: {
    height: 300,
    marginTop: 10,
  },
  emailHeader: {
    marginLeft: 15,
    marginRight: 15,
  },
  confirmedMessage: {
    marginTop: 15,
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 15,
  },
  inputsWrapper: {},
  inputs: {
    marginTop: 5,
    marginBottom: 5,
  },
  selectDepartment: {},
  interestContainer: {},
  interestItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
}));

type UserInfoType = {
  user: {
    firstName: string;
    lastName: string;
    major: string;
    department: string;
    graduationYear: number;
    interests: string[];
  };
};

type Props = {
  open: boolean;
  communityID: string;
  handleSnackbar: (message: string, mode: SnackbarMode) => void;
  onClose: () => any;

  accessToken: string;
  refreshToken: string;
};

function PersonalInfoModal(props: Props) {
  const styles = useStyles();

  const { open, communityID, handleSnackbar, onClose } = props;

  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [major, setMajor] = useState<string>();
  const [department, setDepartment] = useState<string>();
  const [graduationYear, setGraduationYear] = useState<number>();
  const [interests, setInterests] = useState<string[]>([]);

  const [currInterest, setCurrInterest] = useState<string>('');
  const [universityDepartments, setUniversityDepartments] = useState<string[]>([]);

  const [inputErr, setInputErr] = useState<string>();

  const [serverErr, setServerErr] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchUserInfo();
      setInputErr(undefined);
    }
  }, [open]);

  async function fetchUserInfo() {
    setLoading(true);

    const userPromise = makeRequest<UserInfoType>(
      'GET',
      '/api/user/profile/user',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    const departmentPromise = makeRequest<{ departments: string[] }>(
      'GET',
      '/api/university/departments'
    );

    Promise.all([userPromise, departmentPromise]).then(
      ([userData, departmentData]) => {
        if (userData.data.success === -1 || departmentData.data.success === -1) {
          alert('There was an error fetching User data');
          return onClose();
        }

        const userInfo = userData.data.content.user;
        setFirstName(userInfo.firstName);
        setLastName(userInfo.lastName);
        setMajor(userInfo.major);
        setDepartment(userInfo.department);
        setGraduationYear(userInfo.graduationYear);
        setInterests(userInfo.interests);

        setUniversityDepartments(departmentData.data.content.departments);

        setLoading(false);
      }
    );
  }

  const submitInfoAndInterest = async () => {
    setLoading(true);
    setServerErr(undefined);
    const userInfoPromise = makeRequest('POST', `/api/mtg/updateUserInfo`, {
      firstName,
      lastName,
      major,
      department,
      graduationYear,
      interests,
    });

    const interestPromise = makeRequest(
      'POST',
      `/api/mtg/updateInterest/${communityID}`,
      { interested: true }
    );

    Promise.all([userInfoPromise, interestPromise]).then(
      ([userInfoData, interestData]) => {
        if (userInfoData.data.success !== 1 || interestData.data.success !== 1)
          handleSnackbar('There was an error updating interest', 'error');
        else {
          handleSnackbar('Successfully submitted interest!', 'success');
          onClose();
        }

        setLoading(false);
      }
    );
  };

  const handleNewInterest = (e: any) => {
    if (e.keyCode === ENTER_KEYCODE && currInterest.length > 0) {
      e.preventDefault();
      setInterests((prevInterests) => prevInterests?.concat(currInterest));
      setCurrInterest('');
    }
  };

  const removeInterest = (idx: number) => {
    setInterests((prevInterests) => {
      let newInterests = prevInterests.slice();
      newInterests.splice(idx, 1);
      return newInterests;
    });
  };

  const renderInterests = () => {
    const interestItems: any[] = [];

    for (let i = 0; i < interests.length; i++) {
      interestItems.push(
        <div className={styles.interestItem} key={i}>
          <RSText size={12} color={colors.secondaryText} italic>
            {interests[i]}
          </RSText>
          <IconButton size="small" onClick={() => removeInterest(i)}>
            X
          </IconButton>
        </div>
      );
    }

    return <div className={styles.interestContainer}>{interestItems}</div>;
  };

  const renderInputs = () => {
    return (
      <div className={styles.inputsWrapper}>
        <TextField
          className={styles.inputs}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          variant="outlined"
          label="First Name"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <TextField
          className={styles.inputs}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          variant="outlined"
          label="Last Name"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <TextField
          className={styles.inputs}
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          fullWidth
          variant="outlined"
          label="Major"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <FormControl className={styles.inputs} variant="outlined" fullWidth>
          <InputLabel id="departmentLabel">Department</InputLabel>
          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value as string)}
            labelId="departmentLabel"
            label="Department"
          >
            {universityDepartments.map((singleDepartment) => (
              <MenuItem value={singleDepartment}>{singleDepartment}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          className={styles.inputs}
          value={graduationYear}
          onChange={(e) => setGraduationYear(Number.parseInt(e.target.value))}
          fullWidth
          variant="outlined"
          label="Graduation Year"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        <TextField
          className={styles.inputs}
          value={currInterest}
          onChange={(e) => setCurrInterest(e.target.value)}
          onKeyDown={handleNewInterest}
          fullWidth
          variant="outlined"
          label="Hobbies/Interests"
          placeholder="Type New Interest and Press Enter"
          error={Boolean(inputErr)}
          helperText={inputErr}
        />
        {renderInterests()}
        <BigButton
          label="Submit Info and Interest"
          onClick={submitInfoAndInterest}
        />
      </div>
    );
  };

  return (
    <>
      <RSModal
        open={open}
        title={`Update Personal Info`}
        onClose={onClose}
        className={styles.modal}
        helperText={
          'Update your personal information to help the organization get to know you better'
        }
        helperIcon={<RiMessage2Line size={60} />}
        serverErr={serverErr}
      >
        <div className={styles.contentWrapper}>
          {loading ? <CircularProgress size={60} /> : renderInputs()}
        </div>
      </RSModal>
    </>
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

export default connect(mapStateToProps, mapDispatchToProps)(PersonalInfoModal);
