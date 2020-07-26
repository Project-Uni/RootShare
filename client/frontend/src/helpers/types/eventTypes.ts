export type EventType = {
  _id: string;
  title: string;
  brief_description: string;
  full_description: string;
  host: HostType;
  speakers: SpeakerType[];
  attendees: string[];
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
