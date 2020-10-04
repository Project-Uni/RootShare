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
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
  incomingPendingCommunityFollowRequests: string[];
  numMembers?: number;
  numMutual?: number;
  profilePicture?: string;
  status: CommunityStatus;
};

export type CommunityStatus = 'PENDING' | 'JOINED' | 'OPEN';

export type CommunityType =
  | 'Social'
  | 'Business'
  | 'Just for Fun'
  | 'Athletics'
  | 'Student Organization'
  | 'Academic';

export type AdminCommunityServiceResponse = {
  _id: string;
  name: string;
  admin: string;
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
