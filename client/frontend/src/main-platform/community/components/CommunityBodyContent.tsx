import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import { RSTabs, UserPost } from '../../reusable-components';
import CommunityMakePostContainer from './CommunityMakePostContainer';
import CommunityMembers from './CommunityMembers';

import {
  PostType,
  AdminCommunityServiceResponse,
  CommunityStatus,
  CommunityPostingOption,
  SearchUserType,
} from '../../../helpers/types';
import {
  makeRequest,
  formatDatePretty,
  formatTime,
  slideLeft,
} from '../../../helpers/functions';
import { CommunityFlags } from './CommunityBody';

import { EventInformationServiceResponse } from './MeetTheGreeks/EventEditor/MeetTheGreeksModal';
import { Event } from '../../meet-the-greeks/MeetTheGreeks';
import MTGEvent from '../../meet-the-greeks/MTGEvent';
import ManageSpeakersSnackbar from '../../../event-client/event-video/event-host/ManageSpeakersSnackbar';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  loadingIndicator: {
    color: Theme.bright,
    marginTop: 80,
  },
  errorContainer: {
    marginTop: 30,
  },
  postStyle: {
    margin: 8,
  },
  noPosts: {
    marginTop: 20,
  },
  tabs: {
    marginLeft: 5,
    marginRight: 5,
  },
  mtgEvent: {
    marginLeft: 8,
    marginRight: 8,
  },
}));

type Props = {
  className?: string;
  communityID: string;
  universityName: string;
  communityProfilePicture?: string;
  name: string;
  status: CommunityStatus;
  isAdmin?: boolean;
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  private?: boolean;
  flags: CommunityFlags;
  communityName: string;
};

type CommunityTab =
  | 'external'
  | 'internal'
  | 'internal-alumni'
  | 'internal-current'
  | 'following'
  | 'members';

var tabChangeSemaphore = 0;
// Semaphore was added in to fix issue where previous tab
// posts would be loaded into an incorrect tab if the user
// switched tabs before the network request completed.

function CommunityBodyContent(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<CommunityTab>('external');
  const [postingOptions, setPostingOptions] = useState<CommunityPostingOption[]>([]);
  const [posts, setPosts] = useState<JSX.Element[]>([]);
  const [members, setMembers] = useState<SearchUserType[]>([]);
  const [mtgEvent, setMtgEvent] = useState<Event>();

  const [fetchErr, setFetchErr] = useState(false);

  const tabs = [
    { label: 'External', value: 'external' },
    { label: 'Members', value: 'members' },
  ];

  if (!props.private || props.status === 'JOINED') {
    tabs.splice(1, 0, { label: 'Following', value: 'following' });
  }

  if (props.private && props.status === 'JOINED') {
    if (props.isAdmin) {
      tabs.splice(1, 0, { label: 'Internal Current', value: 'internal-current' });
      tabs.splice(2, 0, { label: 'Internal Alumni', value: 'internal-alumni' });
    } else {
      tabs.splice(1, 0, { label: 'Internal', value: 'internal' });
    }
  }

  //Snackbar
  const [transition, setTransition] = useState<any>(() => slideLeft);
  const [snackbarMode, setSnackbarMode] = useState<
    'notify' | 'success' | 'error' | null
  >(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const dispatchSnackbar = (mode: typeof snackbarMode, message: string) => {
    setSnackbarMessage(message);
    setSnackbarMode(mode);
  };

  useEffect(() => {
    if (props.communityProfilePicture && !loading && mtgEvent) {
      setMtgEvent((prev) => {
        return Object.assign({}, prev, {
          community: {
            _id: prev!.community._id,
            name: prev!.community.name,
            profilePicture: props.communityProfilePicture,
          },
        });
      });
    }
  }, [props.communityProfilePicture, loading]);

  useEffect(() => {
    setLoading(true);
    if (selectedTab === 'external') fetchCurrentEventInformation();
    fetchData().then(() => {
      if (selectedTab === 'external')
        fetchCurrentEventInformation().then(() => setLoading(false));
      else setLoading(false);
    });
  }, [selectedTab]);

  useEffect(() => {
    updatePostingOptions();
  }, [selectedTab, props.communityProfilePicture]);

  const fetchCurrentEventInformation = useCallback(async () => {
    const { data } = await makeRequest<EventInformationServiceResponse>(
      'GET',
      `/api/mtg/event/${props.communityID}`
    );
    if (data.success === 1) {
      const { mtgEvent: mtgEvent_raw } = data.content;

      setMtgEvent({
        _id: mtgEvent_raw._id,
        description: mtgEvent_raw.description,
        introVideoURL: mtgEvent_raw.introVideoURL,
        dateTime: mtgEvent_raw.dateTime,
        eventBanner: mtgEvent_raw.eventBanner,
        community: {
          _id: props.communityID,
          profilePicture: props.communityProfilePicture,
          name: props.communityName,
        },
      });
    }
  }, []);

  async function fetchData() {
    if (selectedTab !== 'members') {
      await fetchPosts();
    } else {
      await fetchMembers();
    }
  }

  async function fetchPosts() {
    setPosts([]);
    const currSemaphoreState = tabChangeSemaphore;
    const routeSuffix = getRouteSuffix();
    const { data } = await makeRequest(
      'GET',
      `/api/posts/community/${props.communityID}/${routeSuffix}`
    );
    if (tabChangeSemaphore === currSemaphoreState) {
      if (data.success === 1) {
        setFetchErr(false);
        setPosts(createFeed(data.content['posts']));
      } else {
        setFetchErr(true);
      }
      await updatePostingOptions();
    }
  }

  async function getAdminCommunities() {
    const { data } = await makeRequest(
      'GET',
      `/api/user/${props.user._id}/communities/admin`
    );

    if (data.success === 1) {
      const communities: AdminCommunityServiceResponse[] = data.content.communities.filter(
        (community: AdminCommunityServiceResponse) => {
          let currFollowing = false;
          for (let i = 0; i < community.followingCommunities.length; i++)
            if (community.followingCommunities[i].to._id === props.communityID) {
              currFollowing = true;
              break;
            }

          return currFollowing;
        }
      );

      return communities;
    } else return [];
  }

  async function fetchMembers() {
    const currSemaphoreState = tabChangeSemaphore;
    const { data } = await makeRequest(
      'GET',
      `/api/community/${props.communityID}/members`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (tabChangeSemaphore === currSemaphoreState) {
      if (data.success === 1) {
        setFetchErr(false);
        setMembers(data.content['members']);
      } else {
        setFetchErr(true);
      }
    }
  }

  function getRouteSuffix() {
    switch (selectedTab) {
      case 'external':
        return 'external';
      case 'internal':
        return props.user.accountType === 'student'
          ? 'internal/current'
          : 'internal/alumni';
      case 'internal-current':
        return 'internal/current';
      case 'internal-alumni':
        return 'internal/alumni';
      case 'following':
        return 'following';
    }
  }

  async function updatePostingOptions() {
    let newPostingOptions: CommunityPostingOption[] = [];
    //Internal
    if (
      selectedTab === 'internal-current' ||
      (selectedTab === 'internal' && props.user.accountType === 'student')
    ) {
      newPostingOptions.push({
        description: 'Post',
        routeSuffix: 'internal/current',
        profilePicture: props.user.profilePicture,
      });
    } else if (
      selectedTab === 'internal-alumni' ||
      (selectedTab === 'internal' && props.user.accountType === 'alumni')
    ) {
      newPostingOptions.push({
        description: 'Post',
        routeSuffix: 'internal/alumni',
        profilePicture: props.user.profilePicture,
      });
    }
    //External
    else if (selectedTab === 'external') {
      if (props.isAdmin) {
        newPostingOptions.push({
          description: `${props.name}`,
          routeSuffix: 'external/admin',
          profilePicture: props.communityProfilePicture,
        });
      }

      const followingCommunities = await getAdminCommunities();

      if (followingCommunities.length > 0) {
        followingCommunities.forEach((followingCommunity) => {
          newPostingOptions.push({
            description: `${followingCommunity.name}`,
            routeSuffix: 'external/following',
            communityID: followingCommunity._id,
            profilePicture: followingCommunity.profilePicture,
          });
        });
      }

      if (props.status === 'JOINED' || !props.private)
        newPostingOptions.unshift({
          description: `${props.user.firstName} ${props.user.lastName}`,
          routeSuffix: 'external/member',
          profilePicture: props.user.profilePicture,
        });
    }
    setPostingOptions(newPostingOptions);
  }

  function handleTabChange(newTab: CommunityTab) {
    if (newTab !== selectedTab) {
      tabChangeSemaphore++;
      setSelectedTab(newTab);
    }
  }

  function createFeed(posts: PostType[]) {
    const output = [];
    for (let i = 0; i < posts.length; i++) {
      const currPost = posts[i];
      const { anonymous } = currPost;
      output.push(
        <UserPost
          postID={posts[i]._id}
          posterID={
            currPost.anonymous ? currPost.fromCommunity._id : currPost.user._id
          }
          name={
            anonymous
              ? `${currPost.fromCommunity.name}`
              : `${currPost.user.firstName} ${currPost.user.lastName}`
          }
          timestamp={`${formatDatePretty(
            new Date(currPost.createdAt)
          )} at ${formatTime(new Date(currPost.createdAt))}`}
          profilePicture={
            anonymous
              ? currPost.fromCommunity.profilePicture
              : currPost.user.profilePicture
          }
          type={currPost.type}
          message={currPost.message}
          likeCount={currPost.likes}
          commentCount={currPost.comments}
          style={styles.postStyle}
          key={currPost._id}
          anonymous={anonymous}
          toCommunity={
            selectedTab === 'following' ? currPost.toCommunity.name : undefined
          }
          toCommunityID={
            selectedTab === 'following' ? currPost.toCommunity._id : undefined
          }
          liked={posts[i].liked}
          images={posts[i].images}
          isOwnPost={props.user._id === posts[i].user._id}
        />
      );
    }
    return output;
  }

  function appendPost(newPostInfo: PostType, profilePicture: string | undefined) {
    setPosts((prevPosts) => {
      const { anonymous } = newPostInfo;
      const newPost = (
        <UserPost
          postID={newPostInfo._id}
          posterID={anonymous ? newPostInfo.fromCommunity._id : newPostInfo.user._id}
          name={
            anonymous
              ? `${newPostInfo.fromCommunity.name}`
              : `${newPostInfo.user.firstName} ${newPostInfo.user.lastName}`
          }
          timestamp={`${formatDatePretty(
            new Date(newPostInfo.createdAt)
          )} at ${formatTime(new Date(newPostInfo.createdAt))}`}
          profilePicture={profilePicture}
          message={newPostInfo.message}
          type={newPostInfo.type}
          likeCount={0}
          commentCount={0}
          style={styles.postStyle}
          key={newPostInfo._id}
          anonymous={anonymous}
          images={newPostInfo.images}
          isOwnPost
        />
      );

      return [newPost].concat(prevPosts);
    });
  }

  function renderBody() {
    if (selectedTab === 'members') return <CommunityMembers members={members} />;
    return (
      <div>
        {postingOptions.length > 0 && (
          <CommunityMakePostContainer
            communityID={props.communityID}
            communityName={props.name}
            postingOptions={postingOptions}
            appendNewPost={appendPost}
            isAdmin={props.isAdmin}
            communityProfilePicture={props.communityProfilePicture}
          />
        )}
        {props.flags.isMTGFlag && mtgEvent && (
          <MTGEvent
            event={mtgEvent}
            dispatchSnackbar={dispatchSnackbar}
            className={styles.mtgEvent}
          />
        )}
        {posts.length > 0 ? posts : renderNoPosts()}
      </div>
    );
  }

  function renderError() {
    return (
      <div className={styles.errorContainer}>
        <RSText size={16} bold type="head">
          There was an error fetching the posts.
        </RSText>
      </div>
    );
  }

  function renderNoPosts() {
    return (
      <RSText size={16} type="head" className={styles.noPosts}>
        There are no posts yet.
      </RSText>
    );
  }

  return (
    <div
      className={[styles.wrapper, props.className].join(' ')}
      style={{
        background: loading || posts.length === 0 ? 'inherit' : Theme.background,
      }}
    >
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <RSTabs
        tabs={tabs}
        selected={selectedTab}
        onChange={handleTabChange}
        className={styles.tabs}
      />
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : fetchErr ? (
        renderError()
      ) : (
        renderBody()
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

export default connect(mapStateToProps, mapDispatchToProps)(CommunityBodyContent);
