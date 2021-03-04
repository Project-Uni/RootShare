import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';

import ProfileHead from './ProfileHead';
import ProfileEvent from './ProfileEvent';
import { UserPost, MakePostContainer } from '../../reusable-components';
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
import { getProfilePictureAndBanner } from '../../../api';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
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
  noPosts: {
    marginTop: 20,
  },
}));

type Props = {
  user: any;
};

function ProfileBody(props: Props) {
  const styles = useStyles();
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);

  const [currentProfileState, setCurrentProfileState] = useState<
    UserToUserRelationship
  >('open');
  const [currentPicture, setCurrentPicture] = useState<string>();
  const [currentBanner, setCurrentBanner] = useState<string>();
  const [profileState, setProfileState] = useState<UserType>();
  const [events, setEvents] = useState<EventType[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchingErr, setFetchingErr] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsFetchErr, setPostsFetchErr] = useState(false);

  const { profileID } = useParams<{ profileID: string }>();

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (profileID) {
      fetchProfile().then(([success, profile]) => {
        if (success) {
          getCurrentProfilePicture();
          updateProfileState();
          fetchEvents();
          getUserPosts(profile).then(() => {
            setLoadingPosts(false);
          });
        }
      });
    }
  }, [profileID]);

  async function fetchProfile() {
    const { data } = await makeRequest('GET', `/api/user/profile/${profileID}`);

    if (data['success'] === 1) {
      setProfileState(data['content']['user']);
      setLoading(false);
      return [true, data['content']['user']];
    } else setFetchingErr(true);

    setLoading(false);
    return [false, null];
  }

  async function updateProfileState() {
    if (profileID === 'user') return setCurrentProfileState(U2UR.SELF);

    const { data } = await makeRequest('POST', '/user/checkConnectedWithUser', {
      requestUserID: profileID,
    });

    if (data['success'] === 1) setCurrentProfileState(data['content']['connected']);
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  async function getCurrentProfilePicture() {
    const data = await getProfilePictureAndBanner('user', profileID, {
      getProfile: true,
      getBanner: true,
    });

    if (data['success'] === 1) {
      setCurrentPicture(data['content']['profile']);
      setCurrentBanner(data.content.banner);
    }
  }

  async function fetchEvents() {
    const { data } = await makeRequest('GET', `/api/user/events/${profileID}`);

    if (data['success'] === 1) setEvents(data['content']['events']);
  }

  async function getUserPosts(profile: UserType) {
    const { data } = await makeRequest('GET', `/api/posts/user/${profileID}/all`);

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

  function appendNewPost(post: PostType) {
    setPosts((prevState) => {
      return [post].concat(prevState);
    });
  }

  function renderProfileAndBackground() {
    return (
      <div style={{ textAlign: 'left' }}>
        <ProfileBanner
          type="profile"
          height={200}
          editable={currentProfileState === U2UR.SELF}
          zoomOnClick
          borderRadius={10}
          currentPicture={currentBanner}
        />
        <ProfilePicture
          type="profile"
          className={styles.profilePictureContainer}
          pictureStyle={styles.profilePicture}
          editable={currentProfileState === U2UR.SELF}
          height={150}
          width={150}
          borderRadius={150}
          currentPicture={
            profileID === 'user' ? props.user.profilePicture : currentPicture
          }
          zoomOnClick
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
          currentProfileState={currentProfileState}
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
      const currPost = posts[i];
      output.push(
        <UserPost
          postID={currPost._id}
          posterID={profileID}
          name={`${currPost.user?.firstName} ${currPost.user?.lastName}`}
          profilePicture={
            profileID === 'user' ? props.user.profilePicture : currentPicture
          }
          timestamp={(function() {
            const date = new Date(currPost.createdAt);
            return `${formatDatePretty(date)} at ${formatTime(date)}`;
          })()}
          message={currPost.message}
          likeCount={currPost.likes}
          commentCount={currPost.comments}
          style={styles.post}
          liked={currPost.liked}
          images={currPost.images}
          isOwnPost={profileID === 'user'}
        />
      );
    }

    if (posts.length === 0)
      output.push(
        <RSText size={16} type="head" className={styles.noPosts}>
          There are no posts yet.
        </RSText>
      );
    return (
      <div style={{ background: Theme.background, paddingTop: 1 }}>{output}</div>
    );
  }

  function renderProfile() {
    const profile = profileState as UserType;
    const university = profile.university as UniversityType;

    return (
      <div style={{ height: height }}>
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
              currentProfileState={currentProfileState}
              updateProfileState={updateProfileState}
            />
          </Box>

          {renderRegisteredEvents()}
          {profileID === 'user' && (
            <MakePostContainer
              appendNewPost={appendNewPost}
              profilePicture={props.user.profilePicture}
            />
          )}
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
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileBody);
