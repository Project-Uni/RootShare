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
  numMutual?: number;
  numCommunities?: number;
};

export type ConnectionRequestType = {
  _id: string;
  from: string | UserType;
  to: string | UserType;
  createdAt: Date;
};

export type ProfileState =
  | 'SELF'
  | 'CONNECTION'
  | 'TO'
  | 'FROM'
  | 'PUBLIC'
  | 'PENDING';

//NOTE - Pending added for general display when figuring out from / to not needed
