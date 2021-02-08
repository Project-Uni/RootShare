import { UserType } from './index';

export type Community = {
  _id: string;
  name: string;
  description: string;
  admin: string | UserType;
  university: {
    _id: string;
    universityName: string;
  };
  members: string[];
  pendingMembers: string[];
  private: boolean;
  type: CommunityType;
  incomingPendingCommunityFollowRequests: string[];
  numMembers?: number;
  numMutual?: number;
  profilePicture?: string;
  status: UserToCommunityRelationship;
  isMTGFlag?: boolean; //For Meet the Greeks
};

export type UserToCommunityRelationship = 'pending' | 'joined' | 'open' | 'admin';

export const U2CR = {
  PENDING: <UserToCommunityRelationship>'pending',
  JOINED: <UserToCommunityRelationship>'joined',
  OPEN: <UserToCommunityRelationship>'open',
  ADMIN: <UserToCommunityRelationship>'admin',
};

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
