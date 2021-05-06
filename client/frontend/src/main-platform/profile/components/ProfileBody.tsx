import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { updateSidebarComponents } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { CircularProgress, Box } from '@material-ui/core';

import ProfileHead from './ProfileHead';
import ProfileEvent from './ProfileEvent';
import { MakePostContainer } from '../../reusable-components';
import { UserPost } from '../../reusable-components/components/UserPost.v2';
import RSText from '../../../base-components/RSText';
import ProfilePicture from '../../../base-components/ProfilePicture';
import ProfileBanner from '../../../base-components/ProfileBanner';

import {
  UserType,
  UniversityType,
  EventType,
  PostType,
  UserToUserRelationship,
  U2UR,
} from '../../../helpers/types';
import { makeRequest, removeFromStateArray } from '../../../helpers/functions';
import { HEADER_HEIGHT } from '../../../helpers/constants';
import Theme from '../../../theme/Theme';
import { getPosts, getProfilePictureAndBanner } from '../../../api';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {},
  box: {
    marginTop: 8,
    marginBottom: 8,
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
  postsLoadingIndicator: {
    marginTop: 60,
    color: Theme.bright,
  },
  noPosts: {
    marginTop: 20,
  },
}));

type Props = {};

export default function ProfileBody(props: Props) {
  const styles = useStyles();
  const dispatch = useDispatch();

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
  const user = useSelector((state: RootshareReduxState) => state.user);

  useEffect(() => {
    dispatch(
      updateSidebarComponents({
        names: ['discoverCommunities', 'discoverUsers', 'userDocuments'],
        userID: profileID,
      })
    );
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (profileID) {
      fetchProfile().then((success) => {
        if (success) {
          getCurrentProfilePicture();
          updateProfileState();
          getUserPosts();
          // fetchEvents();
        }
      });
    }
  }, [profileID]);

  async function fetchProfile() {
    setLoading(true);
    const { data } = await makeRequest('GET', `/api/user/profile/${profileID}`);

    if (data['success'] === 1) {
      setProfileState(data['content']['user']);
      setLoading(false);
      return true;
    } else setFetchingErr(true);

    setLoading(false);
    return false;
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

  async function getUserPosts() {
    setLoadingPosts(true);
    const data = await getPosts({
      postType: { type: 'user', params: { userID: profileID } },
    });

    if (data.success === 1) {
      const { posts } = data.content;
      setPosts(posts);
    } else {
      setPostsFetchErr(true);
    }
    setLoadingPosts(false);
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
            profileID === 'user' ? user.profilePicture : currentPicture
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

          {/* {renderRegisteredEvents()} */}
          {profileID === 'user' && (
            <MakePostContainer
              appendNewPost={appendNewPost}
              profilePicture={user.profilePicture}
            />
          )}
          {loadingPosts ? (
            <CircularProgress size={100} className={styles.postsLoadingIndicator} />
          ) : posts.length === 0 ? (
            <RSText size={16} type="head" className={styles.noPosts}>
              There are no posts yet.
            </RSText>
          ) : (
            posts.map((post, idx) => (
              <UserPost
                post={post}
                style={{ marginTop: idx !== 0 ? 10 : undefined }}
                onDelete={(postID: string) =>
                  removeFromStateArray(postID, '_id', setPosts)
                }
                key={`post_${profileID}_${idx}`}
              />
            ))
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
