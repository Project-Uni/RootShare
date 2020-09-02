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
  isDev?: boolean;
  isPrivate?: boolean;
};

export type HostType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type SpeakerType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};
