import { EventType } from './eventTypes';
import { UniversityType } from './universityTypes';

export type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: string;
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

export type ProfileState =
  | 'SELF'
  | 'CONNECTED'
  | 'PENDING_TO'
  | 'PENDING_FROM'
  | 'OPEN'
  | 'PENDING';

//NOTE - Pending added for general display when figuring out from / to not needed

export type LeanUser = {
  firstName: string;
  lastName: string;
  state: ProfileState;
  profilePicture?: string;
  _id: string;
};

export type SearchUserType = {
  _id: string;
  firstName: string;
  lastName: string;
  university: UniversityType;
  work?: string;
  position?: string;
  graduationYear?: number;
  profilePicture?: string;
  accountType?: string;
  numMutualCommunities: number;
  numMutualConnections: number;
  status: ProfileState;
};
