import {
  UserSelect,
  CommunitySelect,
  PostSelect,
  CommunityEdgeSelect,
} from './databaseSelects';

export const DatabaseQuery: { [k in Model]: Value } = {
  comment: {
    populates: [],
    select: [],
  },
  community: {
    populates: [
      { path: 'members', select: UserSelect },
      { path: 'pendingMembers', select: UserSelect },
      { path: 'links', select: [] },
      { path: 'documents', select: [] },
      { path: 'university', select: [] },
      {
        path: 'followedByCommunities',
        select: CommunityEdgeSelect,
        populate: { path: 'from', select: CommunitySelect },
      },
      {
        path: 'followingCommunities',
        select: CommunityEdgeSelect,
        populate: { path: 'to', select: CommunitySelect },
      },
      {
        path: 'outgoingPendingCommunityFollowRequests',
        select: CommunityEdgeSelect,
        populate: { path: 'to', select: CommunitySelect },
      },
      {
        path: 'incomingPendingCommunityFollowRequests',
        select: CommunityEdgeSelect,
        populate: { path: 'from', select: CommunitySelect },
      },
      { path: 'internalCurrentMemberPosts', select: PostSelect },
      { path: 'internalAlumniPosts', select: PostSelect },
      { path: 'externalPosts', select: PostSelect },
      { path: 'postsToOtherCommunities', select: PostSelect },
      { path: 'broadcastedPosts', select: PostSelect },
      { path: 'pinnedPosts', select: PostSelect },
    ],
    select: CommunitySelect,
  },
  communityEdge: {
    populates: [
      { path: 'from', select: CommunitySelect },
      { path: 'to', select: CommunitySelect },
    ],
    select: CommunityEdgeSelect,
  },
  connection: { populates: [], select: [] },
  conversation: { populates: [], select: [] },
  document: { populates: [], select: [] },
  externalCommunication: { populates: [], select: [] },
  externalLink: { populates: [], select: [] },
  image: { populates: [], select: [] },
  meetTheGreekInterest: { populates: [], select: [] },
  message: { populates: [], select: [] },
  notification: { populates: [], select: [] },
  phone_verification: { populates: [], select: [] },
  post: {
    populates: [
      { path: 'user', select: UserSelect },
      { path: 'likes', select: UserSelect },
      { path: 'comments', select: [] },
      { path: 'images', select: [] },
      { path: 'toCommunity', select: CommunitySelect },
      { path: 'fromCommunity', select: CommunitySelect },
      { path: 'university', select: [] },
    ],
    select: PostSelect,
  },
  search: { populates: [], select: [] },
  university: { populates: [], select: [] },
  user: {
    populates: [
      { path: 'broadcastedPosts', select: PostSelect },
      { path: 'communityPosts', select: PostSelect },
      { path: 'likes', select: PostSelect },
      { path: 'pendingCommunities', select: CommunitySelect },
      { path: 'joinedCommunities', select: CommunitySelect },
      { path: 'connections', select: [] },
      { path: 'pendingConnections', select: [] },
      { path: 'attendedWebinars', select: [] },
      { path: 'RSVPWebinars', select: [] },
      { path: 'documents', select: [] },
      { path: 'links', select: [] },
      { path: 'university', select: [] },
    ],
    select: UserSelect,
  },
  webinar: { populates: [], select: [] },
};

export const Models = [
  'comment',
  'community',
  'communityEdge',
  'connection',
  'conversation',
  'document',
  'externalCommunication',
  'externalLink',
  'image',
  'meetTheGreekInterest',
  'message',
  'notification',
  'phone_verification',
  'post',
  'search',
  'university',
  'user',
  'webinar',
] as const;

export type Model = typeof Models[number];

type Value = {
  select: string[];
  populates: {
    path: string;
    select: string[];
    populate?: {
      path: string;
      select: string[];
    };
  }[];
};
