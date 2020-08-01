import { EventType } from './eventTypes';

export type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  accountType: string;
  privilegeLevel: number;
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
