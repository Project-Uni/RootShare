export const USER_LEVEL = {
  SUPER_ADMIN: 9,
  ADMIN: 6,
  DEV: 3,
  REGULAR: 1,
};

export const JWT_TOKEN_FIELDS = ['email', '_id', 'privilegeLevel'];

export const JWT_ACCESS_TOKEN_TIMEOUT = '30m';

export type COMMUNITY_TYPE =
  | 'Social'
  | 'Business'
  | 'Just for Fun'
  | 'Athletics'
  | 'Student Organization'
  | 'Academic';

export const CommunityMap = {
  Social: 0,
  Business: 1,
  'Just for Fun': 2,
  Athletics: 3,
  'Student Organization': 4,
  Academic: 5,
};

export type ImageReason =
  | 'profile'
  | 'profileBanner'
  | 'communityProfile'
  | 'communityBanner'
  | 'eventImage'
  | 'eventBanner'
  | 'postImage';
