import { UserType, PostType } from './index';

export type Community = {
  _id: string;
  name: string;
  bio: string;
  description: string;
  admin: string | UserType;
  university: {
    _id: string;
    universityName: string;
  };
  members: string[] | UserType[];
  pendingMembers: string[];
  private: boolean;
  type: CommunityType;
  incomingPendingCommunityFollowRequests: string[];
  numMembers?: number;
  numMutual?: number;
  profilePicture?: string;
  bannerPicture?: string;
  relationship: UserToCommunityRelationship;
  status: UserToCommunityRelationship; // TODO: deprecate this
  scaleEventType?: string; //For MTG and Grand Prix
  externalPosts?: PostType[];
};

export type UserToCommunityRelationship = 'pending' | 'joined' | 'open' | 'admin';

const U2CR = {
  PENDING: 'pending',
  JOINED: 'joined',
  OPEN: 'open',
  ADMIN: 'admin',
} as const;
export { U2CR };

export type CommunityType =
  | 'Social'
  | 'Business'
  | 'Just for Fun'
  | 'Athletics'
  | 'Student Organization'
  | 'Academic'
  | 'Greek';

export const COMMUNITY_TYPES = [
  'Social',
  'Business',
  'Just for Fun',
  'Athletics',
  'Student Organization',
  'Academic',
  'Greek',
];

export type AdminCommunityServiceResponse = {
  _id: string;
  name: string;
  admin: string;
  profilePicture?: string;
  followingCommunities: {
    _id: string;
    to: { _id: string; name: string };
    accepted: boolean;
  }[];
  outgoingPendingCommunityFollowRequests: {
    _id: string;
    to: { _id: string; name: string };
    accepted: boolean;
  }[];
  currentCommunityRelationship?: 'following' | 'pending' | 'open';
};
