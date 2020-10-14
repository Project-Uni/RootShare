import { ConversationType } from './messagingTypes';
import { UserType } from './userTypes';

export type EventType = {
  _id: string;
  title: string;
  brief_description: string;
  full_description: string;
  host: string | HostType;
  hostCommunity: string;
  availableCommunities: string[];
  speakers: string[] | SpeakerType[];
  attendees: {};
  userRSVP: boolean;
  userSpeaker: boolean;
  conversation: string | ConversationType;
  dateTime: Date;
  muxPlaybackID: string;
  muxAssetPlaybackID: string;
  isDev?: boolean;
  isPrivate?: boolean;
};

export type LeanEventType = {
  _id: string;
  title: string;
  dateTime: Date;
  RSVPs: string[];
  hostCommunity?: HostCommunityType;
  brief_description: string;
  full_description: string;
  muxAssetPlaybackID: string;
};

export type HostType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type HostCommunityType = {
  _id: string;
  name: string;
};

export type SpeakerType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type MuxMetaDataType = {
  viewerUserID: string;
  webinarID: string;
  eventTitle: string;
};
