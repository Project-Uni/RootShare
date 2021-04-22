import {
  UserFields,
  CommunityFields,
  PostFields,
  CommunityEdgeFields,
  CommentFields,
  ConnectionFields,
  ConversationFields,
  DocumentFields,
  ExternalCommunicationFields,
  ExternalLinkFields,
  ImageFields,
  MeetTheGreekInterestFields,
  MessageFields,
  NotificationFields,
  PhoneVerificationFields,
  SearchFields,
  UniversityFields,
  WebinarFields,
} from './databaseFields';

export const DatabaseQuery: { [k in Model]: Value } = {
  comment: {
    populates: [
      { path: 'user', select: UserFields },
      { path: 'likes', select: UserFields },
      { path: 'post', select: PostFields },
    ],
    select: CommentFields,
  },
  community: {
    populates: [
      { path: 'members', select: UserFields },
      { path: 'pendingMembers', select: UserFields },
      { path: 'admin', select: UserFields },
      { path: 'links', select: ExternalLinkFields },
      { path: 'documents', select: DocumentFields },
      { path: 'university', select: UniversityFields },
      {
        path: 'followedByCommunities',
        select: CommunityEdgeFields,
        populate: { path: 'from', select: CommunityFields },
      },
      {
        path: 'followingCommunities',
        select: CommunityEdgeFields,
        populate: { path: 'to', select: CommunityFields },
      },
      {
        path: 'outgoingPendingCommunityFollowRequests',
        select: CommunityEdgeFields,
        populate: { path: 'to', select: CommunityFields },
      },
      {
        path: 'incomingPendingCommunityFollowRequests',
        select: CommunityEdgeFields,
        populate: { path: 'from', select: CommunityFields },
      },
      { path: 'internalCurrentMemberPosts', select: PostFields },
      { path: 'internalAlumniPosts', select: PostFields },
      { path: 'externalPosts', select: PostFields },
      { path: 'postsToOtherCommunities', select: PostFields },
      { path: 'broadcastedPosts', select: PostFields },
      { path: 'pinnedPosts', select: PostFields },
    ],
    select: CommunityFields,
  },
  communityEdge: {
    populates: [
      { path: 'from', select: CommunityFields },
      { path: 'to', select: CommunityFields },
    ],
    select: CommunityEdgeFields,
  },
  connection: {
    populates: [
      { path: 'from', select: UserFields },
      { path: 'to', select: UserFields },
    ],
    select: ConnectionFields,
  },
  conversation: {
    populates: [
      { path: 'participants', select: UserFields },
      { path: 'lastMessage', select: MessageFields },
    ],
    select: ConversationFields,
  },
  document: {
    populates: [
      { path: 'user', select: UserFields },
      { path: 'community', select: CommunityFields },
    ],
    select: DocumentFields,
  },
  externalCommunication: {
    populates: [
      { path: 'user', select: UserFields },
      { path: 'community', select: CommunityFields },
    ],
    select: ExternalCommunicationFields,
  },
  externalLink: {
    populates: [
      { path: 'user', select: UserFields },
      { path: 'community', select: CommunityFields },
    ],
    select: ExternalLinkFields,
  },
  image: {
    populates: [
      { path: 'user', select: UserFields },
      { path: 'post', select: PostFields },
    ],
    select: ImageFields,
  },
  meetTheGreekInterest: {
    populates: [
      { path: 'user', select: UserFields },
      { path: 'community', select: CommunityFields },
    ],
    select: MeetTheGreekInterestFields,
  },
  message: {
    populates: [
      { path: 'conversationID', select: ConversationFields },
      { path: 'sender', select: UserFields },
      { path: 'likes', select: UserFields },
    ],
    select: MessageFields,
  },
  notification: {
    populates: [
      { path: 'forUser', select: UserFields },
      { path: 'relatedPost', select: PostFields },
      { path: 'relatedCommunity', select: CommunityFields },
      { path: 'relatedEvent', select: WebinarFields },
      { path: 'relatedUser', select: UserFields },
      { path: 'actionProviderUser', select: UserFields },
      { path: 'actionProviderCommunity', select: CommunityFields },
    ],
    select: NotificationFields,
  },
  phone_verification: { populates: [], select: PhoneVerificationFields },
  post: {
    populates: [
      { path: 'user', select: UserFields },
      { path: 'likes', select: UserFields },
      { path: 'comments', select: CommentFields },
      { path: 'images', select: ImageFields },
      { path: 'toCommunity', select: CommunityFields },
      { path: 'fromCommunity', select: CommunityFields },
      { path: 'university', select: UniversityFields },
    ],
    select: PostFields,
  },
  search: {
    populates: [{ path: 'user', select: UserFields }],
    select: SearchFields,
  },
  university: {
    populates: [{ path: 'communities', select: CommunityFields }],
    select: UniversityFields,
  },
  user: {
    populates: [
      { path: 'broadcastedPosts', select: PostFields },
      { path: 'communityPosts', select: PostFields },
      { path: 'likes', select: PostFields },
      { path: 'pendingCommunities', select: CommunityFields },
      { path: 'joinedCommunities', select: CommunityFields },
      { path: 'connections', select: ConnectionFields },
      { path: 'pendingConnections', select: ConnectionFields },
      { path: 'attendedWebinars', select: WebinarFields },
      { path: 'RSVPWebinars', select: WebinarFields },
      { path: 'documents', select: DocumentFields },
      { path: 'links', select: ExternalLinkFields },
      { path: 'university', select: UniversityFields },
    ],
    select: UserFields,
  },
  webinar: {
    populates: [
      { path: 'host', select: UserFields },
      { path: 'speakers', select: UserFields },
      { path: 'conversation', select: ConversationFields },
      { path: 'RSVPs', select: UserFields },
      { path: 'attendees_V2', select: UserFields },
      { path: 'availableCommunities', select: CommunityFields },
      { path: 'hostCommunity', select: CommunityFields },
      { path: 'blockedUsers', select: UserFields },
    ],
    select: WebinarFields,
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
