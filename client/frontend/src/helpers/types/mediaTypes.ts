import { UserType, PostType } from '.';

export type ImageType = {
  _id: string;
  user: string | UserType;
  post: string | PostType;
  imageType: string;
  fileName: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Link = {
  _id?: string;
  linkType: LinkTypes;
  url: string;
};

export type Document = {
  _id: string;
  entityID: string;
  fileName: string;
  url: string;
};

export type LinkTypes =
  | 'RootShare'
  | 'Google'
  | 'Facebook'
  | 'Instagram'
  | 'Twitter'
  | 'LinkedIn'
  | 'Pinterest'
  | 'Tumblr'
  | 'Flickr'
  | 'WhatsApp'
  | 'Quora'
  | 'Vimeo'
  | 'Medium'
  | 'Myspace'
  | 'Bebo'
  | 'Friendster'
  | 'Imgur'
  | 'Twitch'
  | 'Discord'
  | 'Slack'
  | 'Stack Overflow'
  | 'GitHub'
  | 'Steam'
  | 'Other';

export const WebsiteDict: { url: string; name: LinkTypes }[] = [
  { url: 'rootshare.io', name: 'RootShare' },
  { url: 'google.com', name: 'Google' },
  { url: 'facebook.com', name: 'Facebook' },
  { url: 'instagram.com', name: 'Instagram' },
  { url: 'twitter.com', name: 'Twitter' },
  { url: 'linkedin.com', name: 'LinkedIn' },
  { url: 'pinterest.com', name: 'Pinterest' },
  { url: 'tumblr.com', name: 'Tumblr' },
  { url: 'flickr.com', name: 'Flickr' },
  { url: 'whatsapp.com', name: 'WhatsApp' },
  { url: 'quora.com', name: 'Quora' },
  { url: 'vimeo.com', name: 'Vimeo' },
  { url: 'medium.com', name: 'Medium' },
  { url: 'myspace.com', name: 'Myspace' },
  { url: 'bebo.com', name: 'Bebo' },
  { url: 'friendster.com', name: 'Friendster' },
  { url: 'imgur.com', name: 'Imgur' },
  { url: 'twitch.tv', name: 'Twitch' },
  { url: 'discord.com', name: 'Discord' },
  { url: 'discord.gg', name: 'Discord' },
  { url: 'slack.com', name: 'Slack' },
  { url: 'stackoverflow.com', name: 'Stack Overflow' },
  { url: 'github.com', name: 'GitHub' },
  { url: 'steamcommunity.com', name: 'Steam' },
];

export const ALLOWED_MIME_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/x-png',
  'text/plain',
  'text/csv',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
