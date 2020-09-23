import { CommunityType, UniversityType, ProfileState, CommunityStatus } from '.';

export type DiscoverCommunity = {
  _id: string;
  name: string;
  type: CommunityType;
  description: string;
  private: boolean;
  university: UniversityType;
  profilePicture?: string;
  admin: string;
  numMembers: number;
  numMutual: number;
  status: CommunityStatus;
};

export type DiscoverUser = {
  _id: string;
  firstName: string;
  lastName: string;
  university: UniversityType;
  work?: string;
  position?: string;
  graduationYear?: number;
  profilePicture?: string;
  numMutualConnections: number;
  numMutualCommunities: number;
  status: ProfileState;
};
