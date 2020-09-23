export type Community = {
  _id: string;
  name: string;
  description: string;
  admin: {
    [key: string]: any;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
  };
  outgoingPendingFollowRequests: {
    _id: string;
    to: { _id: string; name: string };
    accepted: boolean;
  };
};
