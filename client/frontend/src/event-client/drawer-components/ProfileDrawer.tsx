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
    marginTop: 17,
  },
  update: {
    marginTop: 20,
    marginLeft: 20,
  },
  updateIndividual: {
    marginTop: 17,
    color: colors.primaryText,
  },
  button: {
    width: '361px',
    marginTop: 20,
    color: colors.primaryText,
    background: colors.bright,
  },
  logoutButton: {
    width: '361px',
    marginTop: 10,
    color: colors.primaryText,
  },
  buttonWrapper: {
    marginLeft: -20,
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutButtonWrapper: {
    marginBottom: 10,
    textAlign: 'center',
  },
  selectCollege: {
    width: 360,
    height: 57,
    marginTop: 17,
    background: colors.fourth,
  },
  collegeOfItem: {
    // Dropdown Menu Items
  },
  root: {
    paddingLeft: 10,
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

  const PurdueColleges = [
    'College of Agriculture',
    'College of Education',
    'College of Engineering',
    'Exploratory Studies',
    'College of Health and Human Sciences',
    'College of Liberal Arts',
    'Krannert School of Management',
    'College of Pharmacy',
    'Purdue Polytechnic Institute',
    'College of Science',
    'College of Veterinary Medicine',
    'Honors College',
    'The Graduate School',
  ];

  // Original User Information
  // Constant Variables For Primary Info

  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalMajor, setOriginalMajor] = useState('');
  const [originalGraduationYear, setOriginalGraduationYear] = useState('');
  const [originalCurrentEmployer, setOriginalCurrentEmployer] = useState('');
  const [originalCurrentRole, setOriginalCurrentRole] = useState('');
  const [originalCollege, setOriginalCollege] = useState('');
  const [originalCollegeOf, setOriginalCollegeOf] = useState('');
  const [originalInterests, setOriginalInterests] = useState('');
  const [originalOrganizations, setOriginalOrganizations] = useState('');
  const [originalGraduateDegree, setOriginalGraduateDegree] = useState('');
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState('');
  const [originalDiscoveryMethod, setOriginalDiscoveryMethod] = useState('');

  const [updatedFirstName, setUpdatedFirstName] = useState('');
  const [updatedLastName, setUpdatedLastName] = useState('');
  const [updatedMajor, setUpdatedMajor] = useState('');
  const [updatedGraduationYear, setUpdatedGraduationYear] = useState('');
  const [updatedCurrentEmployer, setUpdatedCurrentEmployer] = useState('');
  const [updatedCurrentRole, setUpdatedCurrentRole] = useState('');
  const [updatedCollege, setUpdatedCollege] = useState('');
  const [updatedCollegeOf, setUpdatedCollegeOf] = useState('');
  const [updatedInterests, setUpdatedInterests] = useState('');
  const [updatedOrganizations, setUpdatedOrganizations] = useState('');
  const [updatedGraduateDegree, setUpdatedGraduateDegree] = useState('');
  const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState('');
  const [updatedDiscoveryMethod, setUpdatedDiscoveryMethod] = useState('');

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
    setOriginalCollegeOf('College of Science');
    setOriginalInterests('Baddies, Hoes, Thots');
    setOriginalOrganizations('PIKE, Volleyball, APhi Sexers');
    setOriginalGraduateDegree('No');
    setOriginalPhoneNumber('4086449017');
    setOriginalDiscoveryMethod('Creator of Platform');

    setUpdatedFirstName(props.user.firstName);
    setUpdatedLastName(props.user.lastName);
    setUpdatedMajor('Computer Science');
    setUpdatedGraduationYear('2020');
    setUpdatedCurrentEmployer('AutoZone');
    setUpdatedCurrentRole('Senior Lead Software Engineer');
    setUpdatedCollege('Purdue University');
    setUpdatedCollegeOf('College of Science');
    setUpdatedInterests('Baddies, Hoes, Thots');
    setUpdatedOrganizations('PIKE, Volleyball, APhi Sexers');
    setUpdatedGraduateDegree('No');
    setUpdatedPhoneNumber('4086449017');
    setUpdatedDiscoveryMethod('Creator of Platform');
  }

  // Changed User Information
  // Constant Variables For Changed Info

  function updateNewUserInfoToServer() {
    // TODO: Map Out All The Variables To Server To Store Changed User Info

    console.log(updatedFirstName);
    console.log(updatedLastName);
    console.log(updatedMajor);
    console.log(updatedGraduationYear);
    console.log(updatedCurrentEmployer);
    console.log(updatedCurrentRole);
    console.log(updatedCollege);
    console.log(updatedCollegeOf);
    console.log(updatedInterests);
    console.log(updatedOrganizations);
    console.log(updatedGraduateDegree);
    console.log(updatedPhoneNumber);
    console.log(updatedDiscoveryMethod);

    if (updatedFirstName !== originalFirstName) {
      setOriginalFirstName(updatedFirstName);
    }

    if (updatedLastName !== originalLastName) {
      setOriginalLastName(updatedLastName);
    }

    if (updatedMajor !== originalMajor) {
      setOriginalMajor(updatedMajor);
    }

    if (updatedGraduationYear !== originalGraduationYear) {
      setOriginalGraduationYear(updatedGraduationYear);
    }

    if (updatedCurrentEmployer !== originalCurrentEmployer) {
      setOriginalCurrentEmployer(updatedCurrentEmployer);
    }

    if (updatedCurrentRole !== originalCurrentRole) {
      setOriginalCurrentRole(updatedCurrentRole);
    }

    if (updatedCollege !== originalCollege) {
      setOriginalCollege(updatedCollege);
    }

    if (updatedCollegeOf !== originalCollegeOf) {
      setOriginalCollegeOf(updatedCollegeOf);
    }

    if (updatedInterests !== originalInterests) {
      setOriginalInterests(updatedInterests);
    }

    if (updatedOrganizations !== originalOrganizations) {
      setOriginalOrganizations(updatedOrganizations);
    }

    if (updatedGraduateDegree !== originalGraduateDegree) {
      setOriginalGraduateDegree(updatedGraduateDegree);
    }

    if (updatedPhoneNumber !== originalPhoneNumber) {
      setOriginalPhoneNumber(updatedPhoneNumber);
    }

    if (updatedDiscoveryMethod !== originalDiscoveryMethod) {
      setOriginalDiscoveryMethod(updatedDiscoveryMethod);
    }
  }

  // Handle User Info Change Functions
  // TODO: Find What To Pass In As "value"

  function handleUpdatedFirstNameChange(event: any) {
    console.log('Handling first name change...');
    setUpdatedFirstName(event.target.value);
  }

  function handleLastNameChange(event: any) {
    console.log('Handling last name change...');
    setUpdatedLastName(event.target.value);
  }

  function handleMajorChange(event: any) {
    console.log('Handling major change...');
    setUpdatedMajor(event.target.value);
  }

  function handleGraduationYearChange(event: any) {
    console.log('Handling grad year change...');
    setUpdatedGraduationYear(event.target.value);
  }

  function handleCurrentEmployerChange(event: any) {
    console.log('Handling current employer change...');
    setUpdatedCurrentEmployer(event.target.value);
  }

  function handleCurrentRoleChange(event: any) {
    console.log('Handling current role change...');
    setUpdatedCurrentRole(event.target.value);
  }

  function handleCollegeChange(event: any) {
    console.log('Handling college change...');
    setUpdatedCollege(event.target.value);
  }

  function handleCollegeOfChange(event: any) {
    console.log('Handling college of change...');
    setUpdatedCollegeOf(event.target.value);
  }

  function handleInterestsChange(event: any) {
    console.log('Handling interests change...');
    setUpdatedInterests(event.target.value);
  }

  function handleOrganizationsChange(event: any) {
    console.log('Handling organizations change...');
    setUpdatedOrganizations(event.target.value);
  }

  function handleGraduateDegreeChange(event: any) {
    console.log('Handling graduate degree change...');
    setUpdatedGraduateDegree(event.target.value);
  }

  function handlePhoneNumberChange(event: any) {
    console.log('Handling phone number change...');
    setUpdatedPhoneNumber(event.target.value);
  }

  function handleDiscoveryMethodChange(event: any) {
    console.log('Handling discovery method change...');
    setUpdatedDiscoveryMethod(event.target.value);
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
            value={updatedFirstName}
            onChange={handleUpdatedFirstNameChange}
            width={170}
          />
          <UserInfoTextField
            label="Last Name"
            value={updatedLastName}
            onChange={handleLastNameChange}
            width={170}
            className={styles.lastName}
          />
        </div>
        <UserInfoTextField
          label="Major"
          value={updatedMajor}
          onChange={handleMajorChange}
        />
        <UserInfoTextField
          label="Graduation Year"
          value={updatedGraduationYear}
          onChange={handleGraduationYearChange}
        />
        <UserInfoTextField
          label="Current Employer"
          value={updatedCurrentEmployer}
          onChange={handleCurrentEmployerChange}
        />
        <UserInfoTextField
          label="Current Role"
          value={updatedCurrentRole}
          onChange={handleCurrentRoleChange}
        />
        <UserInfoTextField
          label="University"
          value={updatedCollege}
          onChange={handleCollegeChange}
        />
        <Select
          className={styles.selectCollege}
          variant="outlined"
          value={updatedCollegeOf}
          onChange={handleCollegeOfChange}
          label="College"
        >
          {PurdueColleges.map((singleCollege) => (
            <MenuItem value={singleCollege}>{singleCollege}</MenuItem>
          ))}
        </Select>
        <UserInfoTextField
          label="College"
          value={updatedCollegeOf}
          onChange={handleCollegeOfChange}
        />
        <UserInfoTextField
          label="Interests"
          value={updatedInterests}
          onChange={handleInterestsChange}
        />
        <UserInfoTextField
          label="Organizations"
          value={updatedOrganizations}
          onChange={handleOrganizationsChange}
        />
        <UserInfoTextField
          label="Graduate Degree"
          value={updatedGraduateDegree}
          onChange={handleGraduateDegreeChange}
        />
        <UserInfoTextField
          label="Phone Number"
          value={updatedPhoneNumber}
          onChange={handlePhoneNumberChange}
        />
        <UserInfoTextField
          label="Discovery Method"
          value={updatedDiscoveryMethod}
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
          University: {originalCollege}
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          College: {originalCollegeOf}
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
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Graduate Degree: {originalGraduateDegree}
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

  function logoutOnClick() {
    // TODO: Logout On Click - Server Side
  }

  function returnLogoutButton() {
    return (
      <Button
        onClick={() => {
          logoutOnClick();
        }}
        className={styles.logoutButton}
      >
        LOGOUT
      </Button>
    );
  }
  return (
    <div className={styles.wrapper}>
      <div>
        {imageLoaded && returnProfilePicture()}
        {returnNameAndEmail()}
        {!edit && returnStatic()}
        {edit && returnUpdate()}
      </div>
      <div className={styles.logoutButtonWrapper}>{returnLogoutButton()}</div>
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
