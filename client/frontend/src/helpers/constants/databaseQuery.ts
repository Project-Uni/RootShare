import {
  UserSelect,
  CommunitySelect,
  PostSelect,
  CommunityEdgeSelect,
  CommentSelect,
  ConnectionSelect,
  ConversationSelect,
  DocumentSelect,
  ExternalCommunicationSelect,
  ExternalLinkSelect,
  ImageSelect,
  MeetTheGreekInterestSelect,
  MessageSelect,
  NotificationSelect,
  PhoneVerificationSelect,
  SearchSelect,
  UniversitySelect,
  WebinarSelect,
} from './databaseSelects';

export const DatabaseQuery: { [k in Model]: Value } = {
  comment: {
    populates: [
      { path: 'user', select: UserSelect },
      { path: 'likes', select: UserSelect },
      { path: 'post', select: PostSelect },
    ],
    select: CommentSelect,
  },
  community: {
    populates: [
      { path: 'members', select: UserSelect },
      { path: 'pendingMembers', select: UserSelect },
      { path: 'admin', select: UserSelect },
      { path: 'links', select: ExternalLinkSelect },
      { path: 'documents', select: DocumentSelect },
      { path: 'university', select: UniversitySelect },
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
  connection: {
    populates: [
      { path: 'from', select: UserSelect },
      { path: 'to', select: UserSelect },
    ],
    select: ConnectionSelect,
  },
  conversation: {
    populates: [
      { path: 'participants', select: UserSelect },
      { path: 'lastMessage', select: MessageSelect },
    ],
    select: ConversationSelect,
  },
  document: {
    populates: [
      { path: 'user', select: UserSelect },
      { path: 'community', select: CommunitySelect },
    ],
    select: DocumentSelect,
  },
  externalCommunication: {
    populates: [
      { path: 'user', select: UserSelect },
      { path: 'community', select: CommunitySelect },
    ],
    select: ExternalCommunicationSelect,
  },
  externalLink: {
    populates: [
      { path: 'user', select: UserSelect },
      { path: 'community', select: CommunitySelect },
    ],
    select: ExternalLinkSelect,
  },
  image: {
    populates: [
      { path: 'user', select: UserSelect },
      { path: 'post', select: PostSelect },
    ],
    select: ImageSelect,
  },
  meetTheGreekInterest: {
    populates: [
      { path: 'user', select: UserSelect },
      { path: 'community', select: CommunitySelect },
    ],
    select: MeetTheGreekInterestSelect,
  },
  message: {
    populates: [
      { path: 'conversationID', select: ConversationSelect },
      { path: 'sender', select: UserSelect },
      { path: 'likes', select: UserSelect },
    ],
    select: MessageSelect,
  },
  notification: {
    populates: [
      { path: 'forUser', select: UserSelect },
      { path: 'relatedPost', select: PostSelect },
      { path: 'relatedCommunity', select: CommunitySelect },
      { path: 'relatedEvent', select: WebinarSelect },
      { path: 'relatedUser', select: UserSelect },
      { path: 'actionProviderUser', select: UserSelect },
      { path: 'actionProviderCommunity', select: CommunitySelect },
    ],
    select: NotificationSelect,
  },
  phone_verification: { populates: [], select: PhoneVerificationSelect },
  post: {
    populates: [
      { path: 'user', select: UserSelect },
      { path: 'likes', select: UserSelect },
      { path: 'comments', select: CommentSelect },
      { path: 'images', select: ImageSelect },
      { path: 'toCommunity', select: CommunitySelect },
      { path: 'fromCommunity', select: CommunitySelect },
      { path: 'university', select: UniversitySelect },
    ],
    select: PostSelect,
  },
  search: {
    populates: [{ path: 'user', select: UserSelect }],
    select: SearchSelect,
  },
  university: {
    populates: [{ path: 'communities', select: CommunitySelect }],
    select: UniversitySelect,
  },
  user: {
    populates: [
      { path: 'broadcastedPosts', select: PostSelect },
      { path: 'communityPosts', select: PostSelect },
      { path: 'likes', select: PostSelect },
      { path: 'pendingCommunities', select: CommunitySelect },
      { path: 'joinedCommunities', select: CommunitySelect },
      { path: 'connections', select: ConnectionSelect },
      { path: 'pendingConnections', select: ConnectionSelect },
      { path: 'attendedWebinars', select: WebinarSelect },
      { path: 'RSVPWebinars', select: WebinarSelect },
      { path: 'documents', select: DocumentSelect },
      { path: 'links', select: ExternalLinkSelect },
      { path: 'university', select: UniversitySelect },
    ],
    select: UserSelect,
  },
  webinar: {
    populates: [
      { path: 'host', select: UserSelect },
      { path: 'speakers', select: UserSelect },
      { path: 'conversation', select: ConversationSelect },
      { path: 'RSVPs', select: UserSelect },
      { path: 'attendees_V2', select: UserSelect },
      { path: 'availableCommunities', select: CommunitySelect },
      { path: 'hostCommunity', select: CommunitySelect },
      { path: 'blockedUsers', select: UserSelect },
    ],
    select: WebinarSelect,
  },
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
  populates: Populate[];
};

export type Populate = {
  path: string;
  select: string[];
  populate?: {
    path: string;
    select: string[];
  };
};
