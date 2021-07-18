import { EventType } from './eventTypes';
import { UniversityType } from './universityTypes';

export type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType;
  privilegeLevel: number;
  university: string | UniversityType;
  graduationYear: number;
  department: string;
  major: string;
  phoneNumber: string;
  organizations: string[];
  work: string;
  position: string;
  interests: string[];
  bio: string;
  graduateSchool: string;
  discoveryMethod: string;
  sendEmails: boolean;
  confirmed: boolean;
  verified: boolean;
  profilePicture: string;
  RSVPWebinars: string[] | EventType[];
  connections: string[] | UserType[];
  pendingConnections: string[] | UserType[];
  joinedCommunities: string[];
  pendingCommunities: string[];
  numConnections?: number;
  numMutualConnections?: number;
  numCommunities?: number;
  numMutualCommunities?: number;
};

export type ConnectionRequestType = {
  _id: string;
  from: string | UserType;
  to: string | UserType;
  createdAt: Date;
};

export type UserToUserRelationship =
  | 'self'
  | 'connected'
  | 'pending_to'
  | 'pending_from'
  | 'open'
  | 'pending';

const U2UR = {
  SELF: 'self',
  CONNECTED: 'connected',
  PENDING_TO: 'pending_to',
  PENDING_FROM: 'pending_from',
  OPEN: 'open',
  PENDING: 'pending',
} as const;
export { U2UR };

//NOTE - Pending added for general display when figuring out from / to not needed

export type LeanUser = {
  firstName: string;
  lastName: string;
  state: UserToUserRelationship;
  profilePicture?: string;
  _id: string;
};

export type UserAvatar = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
};

export type BoardMember = UserAvatar & { title: string };

export type SearchUserType = {
  _id: string;
  firstName: string;
  lastName: string;
  university: UniversityType;
  work?: string;
  position?: string;
  graduationYear?: number;
  profilePicture?: string;
  accountType?: AccountType;
  numMutualCommunities: number;
  numMutualConnections: number;
  status: UserToUserRelationship;
};

export type AccountType = 'student' | 'alumni' | 'faculty' | 'recruiter';
