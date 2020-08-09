import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import RSText from '../../base-components/RSText';
import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/makeRequest';
import { colors } from '../../theme/Colors';
import { Select, MenuItem } from '@material-ui/core';
import UserInfoTextField from './UserInfoTextField';

import ProfilePicture from '../../base-components/ProfilePicture';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '400px',
  },
  profilePicture: {
    marginTop: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  names: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  nameWrapper: {
    marginTop: 20,
  },
  lastName: {
    marginLeft: 20,
  },
  name: {
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  static: {
    marginTop: 20,
    marginLeft: 20,
  },
  staticIndividual: {
    marginTop: 20,
  },
  update: {
    marginTop: 30,
    marginLeft: 20,
  },
  updateIndividual: {
    marginTop: 20,
    color: colors.primaryText,
  },
  button: {
    marginRight: 20,
    marginTop: 20,
    color: colors.primaryText,
    background: colors.bright,
  },
  buttonWrapper: {
    marginBottom: 10,
    textAlign: 'right',
  },
}));

type Props = {
  user: { [key: string]: any };
};

function ProfileDrawer(props: Props) {
  const styles = useStyles();
  const [currentPicture, setCurrentPicture] = useState<string>();
  const [imageLoaded, setImagedLoaded] = useState(false);
  const [edit, setEdit] = useState(false);
  const [original, setOriginal] = useState(true);

  // Original User Information
  // Constant Variables For Primary Info

  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalMajor, setOriginalMajor] = useState('');
  const [originalGraduationYear, setOriginalGraduationYear] = useState('');
  const [originalCurrentEmployer, setOriginalCurrentEmployer] = useState('');
  const [originalCurrentRole, setOriginalCurrentRole] = useState('');
  const [originalCollege, setOriginalCollege] = useState('');
  const [originalInterests, setOriginalInterests] = useState('');
  const [originalOrganizations, setOriginalOrganizations] = useState('');
  const [originalGraduateDegree, setOriginalGraduateDegree] = useState('');
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState('');
  const [originalDiscoveryMethod, setOriginalDiscoveryMethod] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [currentEmployer, setCurrentEmployer] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [college, setCollege] = useState('');
  const [interests, setInterests] = useState('');
  const [organizations, setOrganizations] = useState('');
  const [graduateDegree, setGraduateDegree] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [discoveryMethod, setDiscoveryMethod] = useState('');

  useEffect(() => {
    setOriginalUserInfo();
  }, []);

  // Set All Initial User Info
  // TODO: Map From Server From Specific User Instead Of Ashwin's Info

  function setOriginalUserInfo() {
    setOriginalFirstName(props.user.firstName);
    setOriginalLastName(props.user.lastName);
    setOriginalMajor('Computer Science');
    setOriginalGraduationYear('2020');
    setOriginalCurrentEmployer('AutoZone');
    setOriginalCurrentRole('Senior Lead Software Engineer');
    setOriginalCollege('Purdue University');
    setOriginalInterests('Baddies, Hoes, Thots');
    setOriginalOrganizations('PIKE, Volleyball, APhi Sexers');
    setOriginalGraduateDegree('No');
    setOriginalPhoneNumber('4086449017');
    setOriginalDiscoveryMethod('Creator of Platform');

    setFirstName(props.user.firstName);
    setLastName(props.user.lastName);
    setMajor('Computer Science');
    setGraduationYear('2020');
    setCurrentEmployer('AutoZone');
    setCurrentRole('Senior Lead Software Engineer');
    setCollege('Purdue University');
    setInterests('Baddies, Hoes, Thots');
    setOrganizations('PIKE, Volleyball, APhi Sexers');
    setGraduateDegree('No');
    setPhoneNumber('4086449017');
    setDiscoveryMethod('Creator of Platform');
  }

  // Changed User Information
  // Constant Variables For Changed Info

  function updateNewUserInfoToServer() {
    // TODO: Map Out All The Variables To Server To Store Changed User Info

    console.log(firstName);
    console.log(lastName);
    console.log(major);
    console.log(graduationYear);
    console.log(currentEmployer);
    console.log(currentRole);
    console.log(college);
    console.log(interests);
    console.log(organizations);
    console.log(graduateDegree);
    console.log(phoneNumber);
    console.log(discoveryMethod);

    if (firstName !== originalFirstName) {
      setOriginalFirstName(firstName);
    }

    if (lastName !== originalLastName) {
      setOriginalLastName(firstName);
    }

    if (major !== originalMajor) {
      setOriginalMajor(major);
    }

    if (graduationYear !== originalGraduationYear) {
      setOriginalGraduationYear(graduationYear);
    }

    if (currentEmployer !== originalCurrentEmployer) {
      setOriginalCurrentEmployer(currentEmployer);
    }

    if (currentRole !== originalCurrentRole) {
      setOriginalCurrentRole(currentRole);
    }

    if (college !== originalCollege) {
      setOriginalCollege(college);
    }

    if (interests !== originalInterests) {
      setOriginalInterests(interests);
    }

    if (organizations !== originalOrganizations) {
      setOriginalOrganizations(organizations);
    }

    if (graduateDegree !== originalGraduateDegree) {
      setOriginalGraduateDegree(graduateDegree);
    }

    if (phoneNumber !== originalPhoneNumber) {
      setOriginalPhoneNumber(phoneNumber);
    }

    if (discoveryMethod !== originalDiscoveryMethod) {
      setOriginalDiscoveryMethod(discoveryMethod);
    }
  }

  // Handle User Info Change Functions
  // TODO: Find What To Pass In As "value"

  function handleFirstNameChange(event: any) {
    console.log('Handling first name change...');
    setFirstName(event.target.value);
  }

  function handleLastNameChange(event: any) {
    console.log('Handling last name change...');
    setLastName(event.target.value);
  }

  function handleMajorChange(event: any) {
    console.log('Handling major change...');
    setMajor(event.target.value);
  }

  function handleGraduationYearChange(event: any) {
    console.log('Handling grad year change...');
    setGraduationYear(event.target.value);
  }

  function handleCurrentEmployerChange(event: any) {
    console.log('Handling current employer change...');
    setCurrentEmployer(event.target.value);
  }

  function handleCurrentRoleChange(event: any) {
    console.log('Handling current role change...');
    setCurrentRole(event.target.value);
  }

  function handleCollegeChange(event: any) {
    console.log('Handling college change...');
    setCollege(event.target.value);
  }

  function handleInterestsChange(event: any) {
    console.log('Handling interests change...');
    setInterests(event.target.value);
  }

  function handleOrganizationsChange(event: any) {
    console.log('Handling organizations change...');
    setOrganizations(event.target.value);
  }

  function handleGraduateDegreeChange(event: any) {
    console.log('Handling graduate degree change...');
    setGraduateDegree(event.target.value);
  }

  function handlePhoneNumberChange(event: any) {
    console.log('Handling phone number change...');
    setPhoneNumber(event.target.value);
  }

  function handleDiscoveryMethodChange(event: any) {
    console.log('Handling discovery method change...');
    setDiscoveryMethod(event.target.value);
  }

  // End Handle Change Functions For User Info

  function editOnClick() {
    setEdit(!edit);
  }

  function saveOnClick() {
    setEdit(!edit);
    updateNewUserInfoToServer();
  }

  function cancelOnClick() {
    setEdit(!edit);
  }

  useEffect(() => {
    getCurrentProfilePicture();
  }, []);

  async function getCurrentProfilePicture() {
    const { data } = await makeRequest(
      'GET',
      `/api/getProfilePicture/${props.user._id}`
    );

    if (data['success'] === 1) {
      setCurrentPicture(data['content']['imageURL']);
    }
    setImagedLoaded(true);
  }

  function updateCurrentPicture(imageData: string) {
    setCurrentPicture(imageData);
  }

  function returnSaveButton() {
    return (
      <div className={styles.buttonWrapper}>
        <Button
          onClick={() => {
            saveOnClick();
          }}
          className={styles.button}
        >
          SAVE
        </Button>
        <Button
          onClick={() => {
            cancelOnClick();
          }}
          className={styles.button}
        >
          CANCEL
        </Button>
      </div>
    );
  }

  function returnEditButton() {
    return (
      <div className={styles.buttonWrapper}>
        <Button
          onClick={() => {
            editOnClick();
          }}
          className={styles.button}
        >
          EDIT
        </Button>
      </div>
    );
  }

  function returnNameAndEmail() {
    return (
      <div className={styles.nameWrapper}>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.name}
          bold
        >
          {originalFirstName} {originalLastName}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.name}
        >
          {props.user.email}
        </RSText>
      </div>
    );
  }

  function returnUpdate() {
    return (
      <div className={styles.update}>
        <div className={styles.names}>
          <UserInfoTextField
            label="First Name"
            value={firstName}
            onChange={handleFirstNameChange}
            width={170}
          />
          <UserInfoTextField
            label="Last Name"
            value={lastName}
            onChange={handleLastNameChange}
            width={170}
            className={styles.lastName}
          />
        </div>
        <UserInfoTextField
          label="Major"
          value={major}
          onChange={handleMajorChange}
        />
        <UserInfoTextField
          label="Graduation Year"
          value={graduationYear}
          onChange={handleGraduationYearChange}
        />
        <UserInfoTextField
          label="Current Employer"
          value={currentEmployer}
          onChange={handleCurrentEmployerChange}
        />
        <UserInfoTextField
          label="Current Role"
          value={currentRole}
          onChange={handleCurrentRoleChange}
        />
        <UserInfoTextField
          label="College"
          value={college}
          onChange={handleCollegeChange}
        />
        <UserInfoTextField
          label="Interests"
          value={interests}
          onChange={handleInterestsChange}
        />
        <UserInfoTextField
          label="Organizations"
          value={organizations}
          onChange={handleOrganizationsChange}
        />
        <UserInfoTextField
          label="Graduate Degree"
          value={graduateDegree}
          onChange={handleGraduateDegreeChange}
        />
        <UserInfoTextField
          label="Phone Number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
        <UserInfoTextField
          label="Discovery Method"
          value={discoveryMethod}
          onChange={handleDiscoveryMethodChange}
        />
        {returnSaveButton()}
      </div>
    );
  }
  function returnStatic() {
    return (
      <div className={styles.static}>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Major: {originalMajor}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Graduation Year: {originalGraduationYear}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Current Employer: {originalCurrentEmployer}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Current Role: {originalCurrentRole}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          College: {originalCollege}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Interests: {originalInterests}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Organizations: {originalOrganizations}
          {organizations && !original}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Graduate Degree: {originalGraduateDegree}
          {graduateDegree && !original}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Phone Number: {originalPhoneNumber}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Discovery Method: {originalDiscoveryMethod}
        </RSText>
        {returnEditButton()}
      </div>
    );
  }
  function returnProfilePicture() {
    return (
      <div>
        <ProfilePicture
          className={styles.profilePicture}
          editable
          height={150}
          width={150}
          borderRadius={150}
          currentPicture={currentPicture}
          updateCurrentPicture={updateCurrentPicture}
        />
      </div>
    );
  }
  return (
    <div className={styles.wrapper}>
      {imageLoaded && returnProfilePicture()}
      {returnNameAndEmail()}
      {!edit && returnStatic()}
      {edit && returnUpdate()}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDrawer);
