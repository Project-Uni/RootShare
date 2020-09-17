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

import {
  UserType,
  UniversityType,
  EventType,
  ProfileState,
} from '../../../helpers/types';
import { makeRequest } from '../../../helpers/functions';

const HEADER_HEIGHT = 64;

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
    marginTop: -88,
    marginLeft: 50,
  },
  profilePicture: {
    border: `8px solid ${colors.primaryText}`,
  },
  event: {
    marginTop: 0,
    marginLeft: 39,
    marginRight: 0,
    borderTop: `1px solid #c5c5c5`,
  },
  post: {
    borderBottom: `1px solid ${colors.fourth}`,
  },
  rootshares: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 15,
    paddingBottom: 15,
    background: colors.secondary,
    borderBottom: `1px solid ${colors.fourth}`,
    borderTop: `1px solid ${colors.fourth}`,
  },
}));

type Props = {
  profileID: string;
  currentProfileState: ProfileState;
  accessToken: string;
  refreshToken: string;
  updateProfileState: () => void;
};

function ProfileBody(props: Props) {
  const styles = useStyles();
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [currentPicture, setCurrentPicture] = useState<string>();
  const [profileState, setProfileState] = useState<UserType>();
  const [events, setEvents] = useState<EventType[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchingErr, setFetchingErr] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (props.profileID) {
      fetchProfile();
      getCurrentProfilePicture();
      fetchEvents();
    }
  }, [props.profileID]);

  async function fetchProfile() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/profile/${props.profileID}`,
      {},
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

  //TODO - Update With New Profile Picture API Route after merging in communities PR
  async function getCurrentProfilePicture() {
    const { data } = await makeRequest(
      'GET',
      `/api/images/profile/${props.profileID}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setCurrentPicture(data['content']['imageURL']);
  }

  async function fetchEvents() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/events/${props.profileID}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) setEvents(data['content']['events']);
  }

  function updateCurrentPicture(imageData: string) {
    setCurrentPicture(imageData);
  }

  function renderProfileAndBackground() {
    return (
      <div style={{ textAlign: 'left' }}>
        <div className={styles.coverPhoto}></div>
        <ProfilePicture
          type="profile"
          className={styles.profilePictureContainer}
          pictureStyle={styles.profilePicture}
          editable={props.currentProfileState === 'SELF'}
          height={150}
          width={150}
          borderRadius={150}
          currentPicture={currentPicture}
          updateCurrentPicture={updateCurrentPicture}
          zoomOnClick={props.currentProfileState !== 'SELF'}
          borderWidth={8}
        />
      </div>
    );
  }

  function removeEvent(eventID: string) {
    let removeIndex = -1;
    for (let i = 0; i < events.length; i++) {
      if (events[i]._id === eventID) {
        removeIndex = i;
        break;
      }
    }

    if (removeIndex !== -1)
      setEvents((prevEvents) => {
        let newEvents = prevEvents.slice();
        newEvents.splice(removeIndex, 1);
        return newEvents;
      });
  }

  function renderRegisteredEvents() {
    const output: any = [];

    events.forEach((event) => {
      output.push(
        <ProfileEvent
          key={event._id}
          profileID={(profileState as UserType)._id}
          event={event}
          style={styles.event}
          currentProfileState={props.currentProfileState}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
          removeEvent={removeEvent}
        />
      );
    });

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
          {renderProfileAndBackground()}
          <ProfileHead
            name={`${profile.firstName} ${profile.lastName}`}
            profileID={profile._id}
            university={university.universityName}
            graduationYear={profile.graduationYear}
            position={profile.position}
            company={profile.work}
            bio={profile.bio}
            numConnections={profile.numConnections!}
            numMutualConnections={profile.numMutualConnections!}
            numCommunities={profile.numCommunities!}
            currentProfileState={props.currentProfileState}
            accessToken={props.accessToken}
            refreshToken={props.refreshToken}
            updateProfileState={props.updateProfileState}
          />
          {renderRegisteredEvents()}
          <RSText
            type="head"
            size={24}
            bold
            color={colors.primaryText}
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
    <div className={styles.wrapper} style={{ height: height }}>
      {loading ? (
        <CircularProgress />
      ) : fetchingErr ? (
        <RSText size={32} type="head" color={colors.error}>
          THERE WAS AN ERROR GETTING THE USER'S PROFILE
        </RSText>
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
