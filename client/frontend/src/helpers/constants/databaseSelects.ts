//SELECT VALUES

export const UserSelect = [
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

export const CommunitySelect = [
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

export const PostSelect = [
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

export const CommunityEdgeSelect = [
  '_id',
  'from',
  'to',
  'accepted',
  'createdAt',
  'updatedAt',
];

export const CommentSelect = [
  '_id',
  'user',
  'message',
  'likes',
  'post',
  'createdAt',
  'updatedAt',
];

export const ConnectionSelect = [
  '_id',
  'from',
  'to',
  'accepted',
  'createdAt',
  'updatedAt',
];

export const ConversationSelect = [
  '_id',
  'participants',
  'lastMessage',
  'createdAt',
  'updated',
];

export const DocumentSelect = [
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

export const ExternalCommunicationSelect = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'mode',
  'community',
  'message',
];

export const ExternalLinkSelect = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'community',
  'linkType',
  'url',
];

export const ImageSelect = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'post',
  'imageType',
  'fileName',
];

export const MeetTheGreekInterestSelect = [
  '_id',
  'updatedAt',
  'createdAt',
  'user',
  'community',
  'answers',
];

export const MessageSelect = [
  '_id',
  'updatedAt',
  'createdAt',
  'conversationID',
  'senderName',
  'sender',
  'content',
  'likes',
];

export const NotificationSelect = [
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

export const PhoneVerificationSelect = [
  '_id',
  'updatedAt',
  'createdAt',
  'email',
  'phoneNumber',
  'code',
  'validUntil',
  'validated',
];

export const SearchSelect = ['_id', 'updatedAt', 'createdAt', 'user', 'query'];

export const UniversitySelect = [
  '_id',
  'updatedAt',
  'createdAt',
  'nickname',
  'universityName',
  'departments',
  'communities',
  'imageRef',
];

export const WebinarSelect = [
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
