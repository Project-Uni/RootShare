import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import ProfileHead from './ProfileHead';
import ProfileEvent from './ProfileEvent';
import { WelcomeMessage, UserPost } from '../../reusable-components';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { UserType, UniversityType } from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
  },
  profileWrapper: {
    background: colors.primaryText,
    overflow: 'scroll',
    borderLeft: `1px solid ${colors.fourth}`,
    borderRight: `1px solid ${colors.fourth}`,
  },
  body: {},
  coverPhoto: {
    background: colors.bright,
    height: 200,
  },
  profilePictureContainer: {
    marginTop: 20,
  },
  profilePicture: {
    height: 175,
    width: 175,
    borderRadius: 100,
    marginTop: -88,
    border: `8px solid ${colors.primaryText}`,
    marginLeft: 50,
  },
  event: {
    marginTop: 0,
    marginLeft: 39,
    marginRight: 0,
    borderTop: `1px solid ${colors.fourth}`,
  },
  post: {
    // marginTop: 1,
    borderBottom: `1px solid ${colors.fourth}`,
  },
  rootshares: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    background: colors.primaryText,
    borderBottom: `1px solid ${colors.fourth}`,
    borderTop: `1px solid ${colors.fourth}`,
  },
}));

type Props = {
  profileID: string;
  accessToken: string;
  refreshToken: string;
};

function ProfileBody(props: Props) {
  const styles = useStyles();
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [currentPicture, setCurrentPicture] = useState<string>();
  const [profileState, setProfileState] = useState<UserType>();

  const [loading, setLoading] = useState(true);
  const [fetchingErr, setFetchingErr] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (props.profileID) {
      fetchProfile();
      getCurrentProfilePicture();
    }
  }, [props.profileID]);

  async function fetchProfile() {
    const { data } = await makeRequest(
      'POST',
      '/user/getProfile',
      {
        userID: props.profileID,
      },
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setProfileState(data['content']['user']);
    else setFetchingErr(true);
    setLoading(false);
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  async function getCurrentProfilePicture() {
    const { data } = await makeRequest(
      'GET',
      `/api/getProfilePicture/${props.profileID}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setCurrentPicture(data['content']['imageURL']);
  }

  function updateCurrentPicture(imageData: string) {
    setCurrentPicture(imageData);
  }

  function renderImages() {
    return (
      <div style={{ textAlign: 'left' }}>
        <div className={styles.coverPhoto}></div>
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

  function renderRegisteredEvents() {
    const output = [];
    for (let i = 0; i < 4; i++)
      output.push(
        <ProfileEvent
          title="The Baby Boilers Are Back"
          date="Aug 14, 2020"
          participationType="SPEAKER"
          style={styles.event}
        />
      );
    return (
      <div style={{ marginLeft: 0, marginRight: 0, marginTop: 20 }}>{output}</div>
    );
  }

  function renderPosts() {
    const output = [];
    for (let i = 0; i < 7; i++) {
      output.push(
        <UserPost
          userID={'testID'}
          userName="Dhruv Patel"
          profilePicture={currentPicture}
          timestamp="July 14th, 2020 6:52 PM"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis."
          likeCount={109}
          commentCount={54}
          style={styles.post}
        />
      );
    }
    return (
      <div
        style={{
          paddingLeft: 1,
          paddingRight: 1,
          background: colors.fourth,
        }}
      >
        {output}
      </div>
    );
  }

  function renderProfile() {
    const profile = profileState as UserType;
    const university = profile.university as UniversityType;

    return (
      <div className={styles.profileWrapper} style={{ height: height }}>
        {/* {showWelcomeModal && (
          <WelcomeMessage
            title="Profile"
            message="See detailed information about each user, what organizations they have joined, and what virtual events they will attend."
            onClose={closeWelcomeMessage}
          />
        )} */}
        <div className={styles.body}>
          {renderImages()}
          <ProfileHead
            name={`${profile.firstName} ${profile.lastName}`}
            userID={profile._id}
            university={university.universityName}
            graduationYear={profile.graduationYear}
            position={profile.position}
            company={profile.work}
            bio={profile.bio}
            numConnections={profile.numConnections!}
            numMutualConnections={profile.numMutual}
            numCommunities={profile.numCommunities!}
          />
          {renderRegisteredEvents()}
          <RSText
            type="head"
            size={24}
            bold
            color={colors.second}
            className={styles.rootshares}
          >
            {profile.firstName}'s RootShares
          </RSText>
          {renderPosts()}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loading ? (
        <CircularProgress />
      ) : fetchingErr ? (
        <div>TODO: FORMAT THIS. THERE HAS BEEN AN ERROR</div>
      ) : (
        renderProfile()
      )}
    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfileBody);
