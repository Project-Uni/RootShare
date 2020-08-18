import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { updateConversations, resetNewMessage } from '../../redux/actions/message';
import { resetMessageSocket } from '../../redux/actions/sockets';
import { colors } from '../../theme/Colors';
import UserInfoTextField from './UserInfoTextField';
import RSText from '../../base-components/RSText';
import ProfilePicture from '../../base-components/ProfilePicture';

import { makeRequest } from '../../helpers/functions';
import {
  UserType,
  UniversityType,
  ConversationType,
  MessageType,
} from '../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '400px',
  },
  profilePictureContainer: {
    marginTop: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicture: {
    border: `3px solid ${colors.primaryText}`,
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
  logoutErr: {
    width: '361px',
    marginTop: 10,
    color: colors.brightError,
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

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
  updateConversations: (conversations: ConversationType[]) => void;
  resetNewMessage: () => void;
  resetMessageSocket: () => void;
};

function ProfileDrawer(props: Props) {
  const styles = useStyles();
  const [currentPicture, setCurrentPicture] = useState<string>();
  const [imageLoaded, setImagedLoaded] = useState(false);
  const [edit, setEdit] = useState(false);

  // Original User Information
  // Constant Variables For Primary Info

  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalMajor, setOriginalMajor] = useState('');
  const [originalGraduationYear, setOriginalGraduationYear] = useState<number>();
  const [originalCurrentEmployer, setOriginalCurrentEmployer] = useState('');
  const [originalCurrentRole, setOriginalCurrentRole] = useState('');
  const [originalCollege, setOriginalCollege] = useState<UniversityType>();
  const [originalCollegeOf, setOriginalCollegeOf] = useState('');
  const [originalInterests, setOriginalInterests] = useState('');
  const [originalOrganizations, setOriginalOrganizations] = useState('');
  const [originalGraduateDegree, setOriginalGraduateDegree] = useState('');
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState('');
  const [originalDiscoveryMethod, setOriginalDiscoveryMethod] = useState('');

  const [updatedFirstName, setUpdatedFirstName] = useState('');
  const [updatedLastName, setUpdatedLastName] = useState('');
  const [updatedMajor, setUpdatedMajor] = useState('');
  const [updatedGraduationYear, setUpdatedGraduationYear] = useState<number>();
  const [updatedCurrentEmployer, setUpdatedCurrentEmployer] = useState('');
  const [updatedCurrentRole, setUpdatedCurrentRole] = useState('');
  const [updatedCollege, setUpdatedCollege] = useState<UniversityType>();
  const [updatedCollegeOf, setUpdatedCollegeOf] = useState('');
  const [updatedInterests, setUpdatedInterests] = useState('');
  const [updatedOrganizations, setUpdatedOrganizations] = useState('');
  const [updatedGraduateDegree, setUpdatedGraduateDegree] = useState('');
  const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState('');
  const [updatedDiscoveryMethod, setUpdatedDiscoveryMethod] = useState('');

  //TODO: Keep as is for now. Will update to show error in the future
  const [fetchingErr, setFetchingErr] = useState(false);
  const [updateErr, setUpdateErr] = useState(false);
  const [logoutErr, setLogoutErr] = useState(false);

  useEffect(() => {
    getProfile();
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

  async function getProfile() {
    const { data } = await makeRequest(
      'POST',
      '/user/getProfile',
      {
        userID: 'user',
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setOriginalUserInfo(data['content']['user']);
    else setFetchingErr(true);
  }

  function setOriginalUserInfo(user: UserType) {
    setOriginalFirstName(user.firstName);
    setOriginalLastName(user.lastName);
    setOriginalMajor(user.major);
    setOriginalGraduationYear(user.graduationYear);
    setOriginalCurrentEmployer(user.work);
    setOriginalCurrentRole(user.position);
    setOriginalCollege(user.university as UniversityType);
    setOriginalCollegeOf(user.department);
    setOriginalInterests(user.interests.join(','));
    setOriginalOrganizations(user.organizations.join(','));
    setOriginalGraduateDegree(user.graduateSchool);
    setOriginalPhoneNumber(user.phoneNumber);
    setOriginalDiscoveryMethod(user.discoveryMethod);
  }

  async function handleLogout() {
    const { data } = await makeRequest('POST', '/auth/logout');
    if (data['success'] !== 1) return setLogoutErr(true);

    props.updateUser({});
    props.updateAccessToken('');
    props.updateRefreshToken('');
    props.updateConversations([]);
    props.resetNewMessage();
    props.resetMessageSocket();
    window.location.href = '/';
  }

  async function updateNewUserInfoToServer() {
    const { data } = await makeRequest(
      'POST',
      '/user/updateProfile',
      {
        firstName: updatedFirstName,
        lastName: updatedLastName,
        major: updatedMajor,
        graduationYear: updatedGraduationYear,
        work: updatedCurrentEmployer,
        position: updatedCurrentRole,
        university: updatedCollege?._id,
        department: updatedCollegeOf,
        interests: updatedInterests.split(','),
        organizations: updatedOrganizations.split(','),
        graduateSchool: updatedGraduateDegree,
        phoneNumber: updatedPhoneNumber,
        discoveryMethod: updatedDiscoveryMethod,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setOriginalToUpdated();
    else setUpdateErr(true);
  }

  function setUpdatedToOriginal() {
    if (updatedFirstName !== originalFirstName)
      setUpdatedFirstName(originalFirstName);

    if (updatedLastName !== originalLastName) setUpdatedLastName(originalLastName);

    if (updatedMajor !== originalMajor) setUpdatedMajor(originalMajor);

    if (updatedGraduationYear !== originalGraduationYear)
      setUpdatedGraduationYear(originalGraduationYear);

    if (updatedCurrentEmployer !== originalCurrentEmployer)
      setUpdatedCurrentEmployer(originalCurrentEmployer);

    if (updatedCurrentRole !== originalCurrentRole)
      setUpdatedCurrentRole(originalCurrentRole);

    if (updatedCollege?._id !== originalCollege?._id)
      setUpdatedCollege(originalCollege);

    if (updatedCollegeOf !== originalCollegeOf)
      setUpdatedCollegeOf(originalCollegeOf);

    if (updatedInterests !== originalInterests)
      setUpdatedInterests(originalInterests);

    if (updatedOrganizations !== originalOrganizations)
      setUpdatedOrganizations(originalOrganizations);

    if (updatedGraduateDegree !== originalGraduateDegree)
      setUpdatedGraduateDegree(originalGraduateDegree);

    if (updatedPhoneNumber !== originalPhoneNumber)
      setUpdatedPhoneNumber(originalPhoneNumber);

    if (updatedDiscoveryMethod !== originalDiscoveryMethod)
      setUpdatedDiscoveryMethod(originalDiscoveryMethod);
  }

  function setOriginalToUpdated() {
    if (originalFirstName !== updatedFirstName)
      setOriginalFirstName(updatedFirstName);

    if (originalLastName !== updatedLastName) setOriginalLastName(updatedLastName);

    if (originalMajor !== updatedMajor) setOriginalMajor(updatedMajor);

    if (originalGraduationYear !== updatedGraduationYear)
      setOriginalGraduationYear(updatedGraduationYear);

    if (originalCurrentEmployer !== updatedCurrentEmployer)
      setOriginalCurrentEmployer(updatedCurrentEmployer);

    if (originalCurrentRole !== updatedCurrentRole)
      setOriginalCurrentRole(updatedCurrentRole);

    if (originalCollege?._id !== updatedCollege?._id)
      setOriginalCollege(updatedCollege);

    if (originalCollegeOf !== updatedCollegeOf)
      setOriginalCollegeOf(updatedCollegeOf);

    if (originalInterests !== updatedInterests)
      setOriginalInterests(updatedInterests);

    if (originalOrganizations !== updatedOrganizations)
      setOriginalOrganizations(updatedOrganizations);

    if (originalGraduateDegree !== updatedGraduateDegree)
      setOriginalGraduateDegree(updatedGraduateDegree);

    if (originalPhoneNumber !== updatedPhoneNumber)
      setOriginalPhoneNumber(updatedPhoneNumber);

    if (originalDiscoveryMethod !== updatedDiscoveryMethod)
      setOriginalDiscoveryMethod(updatedDiscoveryMethod);
  }

  function handleUpdatedFirstNameChange(event: any) {
    setUpdatedFirstName(event.target.value);
  }

  function handleLastNameChange(event: any) {
    setUpdatedLastName(event.target.value);
  }

  function handleMajorChange(event: any) {
    setUpdatedMajor(event.target.value);
  }

  function handleGraduationYearChange(event: any) {
    setUpdatedGraduationYear(event.target.value);
  }

  function handleCurrentEmployerChange(event: any) {
    setUpdatedCurrentEmployer(event.target.value);
  }

  function handleCurrentRoleChange(event: any) {
    setUpdatedCurrentRole(event.target.value);
  }

  function handleCollegeChange(event: any) {
    setUpdatedCollege(event.target.value);
  }

  function handleCollegeOfChange(event: any) {
    setUpdatedCollegeOf(event.target.value);
  }

  function handleInterestsChange(event: any) {
    setUpdatedInterests(event.target.value);
  }

  function handleOrganizationsChange(event: any) {
    setUpdatedOrganizations(event.target.value);
  }

  function handleGraduateDegreeChange(event: any) {
    setUpdatedGraduateDegree(event.target.value);
  }

  function handlePhoneNumberChange(event: any) {
    setUpdatedPhoneNumber(event.target.value);
  }

  function handleDiscoveryMethodChange(event: any) {
    setUpdatedDiscoveryMethod(event.target.value);
  }

  // End Handle Change Functions For User Info

  function handleEditClick() {
    setUpdatedToOriginal();
    setEdit(true);
  }

  function handleSaveClick() {
    setEdit(false);
    updateNewUserInfoToServer();
  }

  function handleCancelClick() {
    setEdit(false);
    setUpdatedToOriginal();
  }

  function renderProfilePicture() {
    return (
      <div>
        <ProfilePicture
          className={styles.profilePictureContainer}
          pictureStyle={styles.profilePicture}
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

  function renderSaveButton() {
    return (
      <div className={styles.buttonWrapper}>
        <Button onClick={handleSaveClick} className={styles.button}>
          SAVE
        </Button>
        <Button onClick={handleCancelClick} className={styles.button}>
          CANCEL
        </Button>
      </div>
    );
  }

  function renderEditButton() {
    return (
      <div className={styles.buttonWrapper}>
        <Button onClick={handleEditClick} className={styles.button}>
          EDIT
        </Button>
      </div>
    );
  }

  function renderNameAndEmail() {
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

  function renderUpdateView() {
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
          value={updatedGraduationYear ? updatedGraduationYear.toString() : ''}
          onChange={handleGraduationYearChange}
          type="number"
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
        <Select
          className={styles.selectCollege}
          variant="outlined"
          value={updatedCollege?.universityName}
          onChange={handleCollegeChange}
          label="University"
        >
          <MenuItem value={'Purdue'}>Purdue</MenuItem>
        </Select>
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
          label="Interests"
          value={updatedInterests}
          onChange={handleInterestsChange}
        />
        <UserInfoTextField
          label="Organizations"
          value={updatedOrganizations}
          onChange={handleOrganizationsChange}
        />
        {/* TODO - Change to yes or no select */}
        {/* <UserInfoTextField
          label="Graduate Degree"
          value={updatedGraduateDegree}
          onChange={handleGraduateDegreeChange}
        /> */}
        <UserInfoTextField
          label="Phone Number"
          value={updatedPhoneNumber}
          onChange={handlePhoneNumberChange}
          type="number"
        />
        <UserInfoTextField
          label="Discovery Method"
          value={updatedDiscoveryMethod}
          onChange={handleDiscoveryMethodChange}
        />
        {renderSaveButton()}
      </div>
    );
  }
  function renderStaticView() {
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
          University: {originalCollege?.universityName}
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
        {/* TODO - Change Graduate Degree to Yes or No Select */}
        {/* <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Graduate Degree: {originalGraduateDegree}
        </RSText> */}
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
        {renderEditButton()}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div>
        {imageLoaded && renderProfilePicture()}
        {renderNameAndEmail()}
        {edit ? renderUpdateView() : renderStaticView()}
      </div>
      <div className={styles.logoutButtonWrapper}>
        <Button
          className={logoutErr ? styles.logoutErr : styles.logoutButton}
          onClick={handleLogout}
        >
          {logoutErr ? 'ERROR LOGGING OUT' : 'LOGOUT'}
        </Button>
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
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
    updateConversations: (conversations: ConversationType[]) => {
      dispatch(updateConversations(conversations));
    },
    resetNewMessage: () => {
      dispatch(resetNewMessage());
    },
    resetMessageSocket: () => {
      dispatch(resetMessageSocket());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDrawer);
