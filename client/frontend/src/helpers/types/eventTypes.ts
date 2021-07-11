import { ConversationType } from './messagingTypes';
import { ExternalEventPrivacyEnum } from '../../helpers/enums';

export type EventType = {
  _id: string;
  title: string;
  brief_description: string;
  full_description: string;
  host: string | HostType;
  hostCommunity: string;
  availableCommunities: string[];
  speakers: string[] | SpeakerType[];
  attendees_V2: { [key: string]: any }[];
  userRSVP: boolean;
  userSpeaker: boolean;
  conversation: string | ConversationType;
  dateTime: Date;
  muxPlaybackID: string;
  muxAssetPlaybackID: string;
  isDev?: boolean;
  isPrivate?: boolean;
  eventImage: string;
  eventBanner: string;
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
  eventBanner: string;
};

export type ExternalEvent = {
  _id: string;
  title: string;
  type: string;
  description: string;
  streamLink: string;
  donationLink: string;
  startTime: Date;
  endTime: Date;
  hostCommunity: string;
  createdByUserID: string;
  privacy: ExternalEventPrivacyEnum;
  banner: string;
  isDev: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExternalEventDefault = {
  _id: string;
  title: string;
  type: string;
  description: string;
  streamLink: string;
  donationLink: string;
  startTime: Date;
  endTime: Date;
  hostCommunity: { _id: string; name: string; profilePicture: string };
  privacy: ExternalEventPrivacyEnum;
  banner: string;
  createdAt: string;
  updatedAt: string;
};

export type EventUserMode = 'viewer' | 'speaker' | 'host';
export type SpeakerMode = 'speaker' | 'host';

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

export type SpeakRequestType = {
  _id: string;
  firstName: string;
  lastName: string;
};

export type GuestSpeaker = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  speakingToken: string;
  connection?: OT.Connection;
};
