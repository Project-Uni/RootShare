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
  phoneNumber: String;
  organizations: string[];
  work: string;
  position: string;
  interests: string[];
  graduateSchool: string;
  discoveryMethod: string;
  sendEmails: boolean;
  confirmed: boolean;
  verified: boolean;
  RSVPWebinars: string[] | EventType[];
  connections: string[] | UserType[];
  pendingConnections: string[] | UserType[];
  joinedCommunities: string[];
  pendingCommunities: string[];
};

export type ConnectionRequestType = {
  _id: string;
  from: string | UserType;
  to: string | UserType;
  createdAt: Date;
};
