import { Types } from 'mongoose';
import { Community, Notifications, Post, User } from '../rootshare_db/models';
import { log } from '../helpers/functions';

type ObjectIdType = Types.ObjectId;
const ObjectIdVal = Types.ObjectId;

export default class NotificationService {
  like = async ({ fromUser, postID }: { fromUser: string; postID: string }) => {
    try {
      const [forUser, fromUserName] = await Promise.all([
        getUserIDForPost(postID),
        getUsername(fromUser),
      ]);

      if (!forUser || !fromUserName || forUser === ObjectIdVal(fromUser)) return;

      await Notifications.create({
        variant: 'like',
        forUser: forUser.toString(),
        actionProviderType: 'user',
        actionProviderId: fromUser,
        relatedItemType: 'post',
        relatedItemId: postID,
        message: `${fromUserName.firstName} ${fromUserName.lastName} liked your post`,
      });
    } catch (err) {
      log('error', err.message);
    }
  };

  comment = async ({
    fromUser,
    postID,
    comment,
  }: {
    fromUser: string;
    postID: string;
    comment: string;
  }) => {
    try {
      const [forUser, fromUserName] = await Promise.all([
        getUserIDForPost(postID),
        getUsername(fromUser),
      ]);

      if (!forUser || !fromUserName || forUser.equals(ObjectIdVal(fromUser))) return;

      await Notifications.create({
        variant: 'comment',
        forUser: forUser.toString(),
        actionProviderType: 'user',
        actionProviderId: fromUser,
        relatedItemType: 'post',
        relatedItemId: postID,
        message: `${fromUserName.firstName} ${fromUserName.lastName} commented on your post: ${comment}`,
      });
    } catch (err) {
      log('error', err.message);
    }
  };

  communityInvite = async ({
    fromUser,
    communityID,
    forUser,
  }: {
    fromUser: string;
    communityID: string;
    forUser: string;
  }) => {
    if (fromUser === forUser) return;
    const [communityName, fromUserName] = await Promise.all([
      getCommunityName(communityID),
      getUsername(fromUser),
    ]);
    if (!communityName || !fromUserName) return;

    try {
      await Notifications.create({
        variant: 'community-invite',
        forUser,
        relatedItemType: 'community',
        relatedItemId: communityID,
        actionProviderType: 'user',
        actionProviderId: fromUser,
        message: `${fromUserName.firstName} ${fromUserName.lastName} invited you to join ${communityName.name}`,
      });
    } catch (err) {
      log('error', err.message);
    }
  };

  connectionAccept = async ({
    fromUser,
    forUser,
  }: {
    fromUser: string;
    forUser: string;
  }) => {
    const fromUserName = await getUsername(fromUser);
    if (!fromUserName) return;

    try {
      await Notifications.create({
        variant: 'connection-accept',
        forUser,
        relatedItemType: 'user',
        relatedItemId: fromUser,
        actionProviderType: 'user',
        actionProviderId: fromUser,
        message: `${fromUserName.firstName} ${fromUserName.lastName} connected with you!`,
      });
    } catch (err) {
      log('error', err.message);
    }
  };

  communityAccept = async ({
    communityID,
    forUser,
  }: {
    communityID: string;
    forUser: string;
  }) => {
    const communityName = await getCommunityName(communityID);
    if (!communityName) return;

    try {
      await Notifications.create({
        variant: 'community-accept',
        forUser,
        relatedItemType: 'community',
        relatedItemId: communityID,
        actionProviderType: 'community',
        actionProviderId: communityID,
        message: `${communityName} accepted your request.`,
      });
    } catch (err) {
      log('error', err.message);
    }
  };

  rootshare = async ({}: {}) => {};

  markAsSeen = async ({ _ids, userID }: { _ids: string[]; userID: string }) => {
    try {
      await Notifications.markAsSeen({ _ids, userID });
    } catch (err) {
      log('error', err);
    }
  };

  getForUser = async ({ userID }: { userID: string }) => {
    try {
      const notifications = await Notifications.findForUser({ userID });
      return notifications;
    } catch (err) {
      log('error', err.message);
      return false;
    }
  };
}

//Helpers
const getUserIDForPost = async (postID: string): Promise<ObjectIdType> => {
  try {
    const post = await Post.model.findById(postID, 'user anonymous').lean().exec();
    if (!post || post.anonymous) return ObjectIdVal('');

    return post.user as ObjectIdType;
  } catch (err) {
    return ObjectIdVal('');
  }
};

const getUsername = async (userID: string) => {
  try {
    const user = await User.model
      .findById(userID, 'firstName lastName')
      .lean()
      .exec();
    if (!user) return false;
    return { firstName: user.firstName, lastName: user.lastName };
  } catch (err) {
    return false;
  }
};

const getCommunityName = async (communityID: string) => {
  try {
    const community = await Community.model
      .findById(communityID, 'name')
      .lean()
      .exec();
    if (!community) return false;
    return { name: community.name };
  } catch (err) {
    return false;
  }
};
