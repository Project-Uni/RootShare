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
