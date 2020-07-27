import { ConversationType } from './messagingTypes';

export type EventType = {
  _id: string;
  title: string;
  brief_description: string;
  full_description: string;
  host: HostType;
  hostCommunity: string;
  availableCommunities: string[];
  speakers: SpeakerType[];
  attendees: string[];
  conversation: string | ConversationType;
  dateTime: Date;
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
