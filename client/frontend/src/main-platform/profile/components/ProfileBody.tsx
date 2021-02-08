import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import ProfileHead from './ProfileHead';
import ProfileEvent from './ProfileEvent';
import { UserPost } from '../../reusable-components';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';

import {
  UserType,
  UniversityType,
  EventType,
  PostType,
  UserToUserRelationship,
  U2UR,
} from '../../../helpers/types';
import {
  makeRequest,
  formatDatePretty,
  formatTime,
} from '../../../helpers/functions';
import { HEADER_HEIGHT } from '../../../helpers/constants';
import ProfileBanner from '../../../base-components/ProfileBanner';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: Theme.background,
  },
  profileWrapper: {
    overflow: 'scroll',
  },
  body: {},
  box: {
    margin: 8,
    background: Theme.white,
  },
  headBox: {
    paddingBottom: 20,
  },
  eventBox: {
    marginBottom: 4,
  },
  profilePictureContainer: {
    marginTop: -88,
    marginLeft: 50,
    display: 'inline-block',
  },
  profilePicture: {
    border: `8px solid ${Theme.white}`,
  },
  event: {
    marginTop: 0,
    marginLeft: 10,
    marginRight: 10,
  },
  eventWithBorder: {
    borderTop: `1px solid ${Theme.dark}`,
  },
  post: {
    margin: 8,
  },
  rootshares: {
    textAlign: 'center',
    marginTop: 10,
    paddingTop: 15,
    paddingBottom: 15,
    background: Theme.primary,
    borderBottom: `1px solid ${Theme.primary}`,
    borderTop: `1px solid ${Theme.primary}`,
  },
  postsLoadingIndicator: {
    marginTop: 60,
    color: Theme.bright,
  },
}));

type Props = {
  user: any;
  profileID: string;
  currentProfileState: UserToUserRelationship;
  accessToken: string;
  refreshToken: string;
  updateProfileState: () => void;
};

function ProfileBody(props: Props) {
  const styles = useStyles();
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [currentPicture, setCurrentPicture] = useState<string>();
  const [currentBanner, setCurrentBanner] = useState<string>();
  const [profileState, setProfileState] = useState<UserType>();
  const [events, setEvents] = useState<EventType[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchingErr, setFetchingErr] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsFetchErr, setPostsFetchErr] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (props.profileID) {
      fetchProfile().then(([success, profile]) => {
        if (success) {
          getCurrentProfilePicture();
          fetchEvents();
          getUserPosts(profile).then(() => {
            setLoadingPosts(false);
          });
        }
      });
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

    if (data['success'] === 1) {
      setProfileState(data['content']['user']);
      setLoading(false);
      return [true, data['content']['user']];
    } else setFetchingErr(true);

    setLoading(false);
    return [false, null];
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  async function getCurrentProfilePicture() {
    const { data } = await makeRequest(
      'GET',
      `/api/images/profile/${props.profileID}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data['success'] === 1) {
      setCurrentPicture(data['content']['profile']);
      setCurrentBanner(data.content.banner);
    }
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

  async function getUserPosts(profile: UserType) {
    const { data } = await makeRequest(
      'GET',
      `/api/posts/user/${props.profileID}/all`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data.success === 1) {
      const { posts } = data.content;
      const cleanedPosts: PostType[] = [];
      for (let i = 0; i < posts.length; i++) {
        const cleanedPost = {
          ...posts[i],
          user: {
            firstName: profile.firstName,
            lastName: profile.lastName,
          },
        };
        cleanedPosts.push(cleanedPost);
      }
      setPosts(cleanedPosts);
    } else {
      setPostsFetchErr(true);
    }
  }

  function renderProfileAndBackground() {
    return (
      <div style={{ textAlign: 'left' }}>
        <ProfileBanner
          type="profile"
          height={200}
          editable={props.currentProfileState === U2UR.SELF}
          zoomOnClick={props.currentProfileState !== U2UR.SELF}
          borderRadius={10}
          currentPicture={currentBanner}
          updateCurrentPicture={(imageData: string) => setCurrentBanner(imageData)}
        />
        <ProfilePicture
          type="profile"
          className={styles.profilePictureContainer}
          pictureStyle={styles.profilePicture}
          editable={props.currentProfileState === U2UR.SELF}
          height={150}
          width={150}
          borderRadius={150}
          currentPicture={
            props.profileID === 'user' ? props.user.profilePicture : currentPicture
          }
          zoomOnClick={props.currentProfileState !== U2UR.SELF}
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

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      output.push(
        <ProfileEvent
          key={event._id}
          profileID={(profileState as UserType)._id}
          event={event}
          style={[styles.event, i !== 0 ? styles.eventWithBorder : null].join(' ')}
          currentProfileState={props.currentProfileState}
          accessToken={props.accessToken}
          refreshToken={props.refreshToken}
          removeEvent={removeEvent}
        />
      );
    }

    return (
      <Box
        className={[styles.box, styles.eventBox].join(' ')}
        boxShadow={2}
        borderRadius={8}
      >
        {output}
      </Box>
    );
  }

  function renderPosts() {
    const output = [];
    for (let i = 0; i < posts.length; i++) {
      output.push(
        <UserPost
          postID={posts[i]._id}
          posterID={props.profileID}
          name={`${posts[i].user.firstName} ${posts[i].user.lastName}`}
          profilePicture={
            props.profileID === 'user' ? props.user.profilePicture : currentPicture
          }
          timestamp={(function() {
            const date = new Date(posts[i].createdAt);
            return `${formatDatePretty(date)} at ${formatTime(date)}`;
          })()}
          message={posts[i].message}
          likeCount={posts[i].likes}
          commentCount={posts[i].comments}
          style={styles.post}
          liked={posts[i].liked}
          images={posts[i].images}
          isOwnPost={props.profileID === 'user'}
        />
      );
    }
    return (
      <div style={{ background: Theme.background, paddingTop: 1 }}>{output}</div>
    );
  }

  function renderProfile() {
    const profile = profileState as UserType;
    const university = profile.university as UniversityType;

    return (
      <div className={styles.profileWrapper} style={{ height: height }}>
        <div className={styles.body}>
          <Box
            boxShadow={2}
            className={[styles.box, styles.headBox].join(' ')}
            borderRadius={8}
          >
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
              numMutualCommunities={profile.numMutualCommunities}
              currentProfileState={props.currentProfileState}
              accessToken={props.accessToken}
              refreshToken={props.refreshToken}
              updateProfileState={props.updateProfileState}
            />
          </Box>

          {renderRegisteredEvents()}
          {loadingPosts ? (
            <CircularProgress size={100} className={styles.postsLoadingIndicator} />
          ) : (
            renderPosts()
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {loading ? (
        <CircularProgress size={100} className={styles.postsLoadingIndicator} />
      ) : fetchingErr ? (
        <RSText size={32} type="head" color={Theme.error}>
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
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileBody);
