export const USER_LEVEL = {
  SUPER_ADMIN: 9,
  ADMIN: 6,
  DEV: 3,
  REGULAR: 1,
};

export const JWT_TOKEN_FIELDS = [
  'email',
  '_id',
  'privilegeLevel',
  'firstName',
  'lastName',
  'accountType',
] as const;

export const JWT_ACCESS_TOKEN_TIMEOUT = '30m';

export type CommunityType =
  | 'Social'
  | 'Business'
  | 'Just for Fun'
  | 'Athletics'
  | 'Student Organization'
  | 'Academic'
  | 'Greek';

export const CommunityMap = {
  Social: 0,
  Business: 1,
  'Just for Fun': 2,
  Athletics: 3,
  'Student Organization': 4,
  Academic: 5,
  Greek: 6,
};

export type ImageReason =
  | 'profile'
  | 'profileBanner'
  | 'communityProfile'
  | 'communityBanner'
  | 'eventImage'
  | 'eventBanner'
  | 'postImage'
  | 'mtgBanner';

export type UserToUserRelationship =
  | 'self'
  | 'connected'
  | 'pending_to'
  | 'pending_from'
  | 'open'
  | 'pending';

export const U2UR = {
  SELF: <UserToUserRelationship>'self',
  CONNECTED: <UserToUserRelationship>'connected',
  PENDING_TO: <UserToUserRelationship>'pending_to',
  PENDING_FROM: <UserToUserRelationship>'pending_from',
  OPEN: <UserToUserRelationship>'open',
  PENDING: <UserToUserRelationship>'pending',
};
