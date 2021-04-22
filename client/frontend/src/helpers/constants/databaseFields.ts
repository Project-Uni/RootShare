// DB Fields

export const UserFields = [
  '_id',
  'firstName',
  'lastName',
  'email',
  'university',
  'accountType',
  'profilePicture',
  'bannerPicture',
  'privilegeLevel',
  'graduationYear',
  'department',
  'major',
  'phoneNumber',
  'work',
  'position',
  'bio',
  'links',
  'documents',
  'RSVPWebinars',
  'attendedWebinars',
  'connections',
  'pendingConnections',
  'joinedCommunities',
  'pendingCommunities',
  'broadcastedPosts',
  'communityPosts',
  'likes',
  'createdAt',
  'updatedAt',
];

export const CommunityFields = [
  '_id',
  'name',
  'admin',
  'private',
  'members',
  'pendingMembers',
  'profilePicture',
  'bannerPicture',
  'type',
  'description',
  'links',
  'documents',
  'university',
  'followedByCommunities',
  'followingCommunities',
  'outgoingPendingCommunityFollowRequests',
  'incomingPendingCommunityFollowRequests',
  'internalCurrentMemberPosts',
  'internalAlumniPosts',
  'externalPosts',
  'postsToOtherCommunities',
  'broadcastedPosts',
  'pinnedPosts',
  'scaleEventType',
  'createdAt',
  'updatedAt',
];

export const PostFields = [
  '_id',
  'user',
  'message',
  'likes',
  'comments',
  'images',
  'toCommunity',
  'fromCommunity',
  'anonymous',
  'type',
  'university',
  'createdAt',
  'updatedAt',
];

export const CommunityEdgeFields = [
  '_id',
  'from',
  'to',
  'accepted',
  'createdAt',
  'updatedAt',
];

export const CommentFields = [
  '_id',
  'user',
  'message',
  'likes',
  'post',
  'createdAt',
  'updatedAt',
];

export const ConnectionFields = [
  '_id',
  'from',
  'to',
  'accepted',
  'createdAt',
  'updatedAt',
];

export const ConversationFields = [
  '_id',
  'participants',
  'lastMessage',
  'createdAt',
  'updated',
];

export const DocumentFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'community',
  'mimeType',
  'fileName',
  'createdAt',
  'updatedAt',
];

export const ExternalCommunicationFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'mode',
  'community',
  'message',
];

export const ExternalLinkFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'community',
  'linkType',
  'url',
];

export const ImageFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'post',
  'imageType',
  'fileName',
];

export const MeetTheGreekInterestFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'community',
  'answers',
];

export const MessageFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'conversationID',
  'senderName',
  'sender',
  'content',
  'likes',
];

export const NotificationFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'message',
  'variant',
  'forUser',
  'seen',
  'relatedItemType',
  'relatedPost',
  'relatedCommunity',
  'relatedEvent',
  'relatedUser',
  'actionProviderType',
  'actionProviderUser',
  'actionProviderCommunity',
  'message',
];

export const PhoneVerificationFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'email',
  'phoneNumber',
  'code',
  'validUntil',
  'validated',
];

export const SearchFields = ['_id', 'updatedAt', 'createdAt', 'user', 'query'];

export const UniversityFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'nickname',
  'universityName',
  'departments',
  'communities',
  'imageRef',
];

export const WebinarFields = [
  '_id',
  'updatedAt',
  'createdAt',
  'title',
  'brief_description',
  'full_description',
  'host',
  'speakers',
  'conversation',
  'RSVPs',
  'attendees_V2',
  'dateTime',
  'opentokSessionID',
  'opentokBroadcastID',
  'muxLiveStreamID',
  'muxPlaybackID',
  'muxAssetPlaybackID',
  'availableCommunities',
  'hostCommunity',
  'private',
  'eventImage',
  'eventBanner',
  'blockedUsers',
  'isDev',
  'scaleEventType',
  'introVideoURL',
];
