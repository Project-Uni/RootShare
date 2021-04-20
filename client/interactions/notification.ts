import {
  Community,
  ICommunity,
  IWebinar,
  Notifications,
  Post,
  User,
  Webinar,
} from '../rootshare_db/models';
import { ObjectIdType, ObjectIdVal } from '../rootshare_db/types';
import { log, sendPacket } from '../helpers/functions';
import { Query } from 'mongoose';

export default class NotificationService {
  like = async ({ fromUser, postID }: { fromUser: string; postID: string }) => {
    try {
      const [forUser, fromUserName] = await Promise.all([
        getUserIDForPost(postID),
        getUsername(fromUser),
      ]);

      if (!forUser || !fromUserName || forUser.equals(ObjectIdVal(fromUser))) return;

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
    if (fromUser === forUser) return false;
    const [communityName, fromUserName] = await Promise.all([
      getCommunityName(communityID),
      getUsername(fromUser),
    ]);
    if (!communityName || !fromUserName) return false;

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
      return true;
    } catch (err) {
      log('error', err.message);
      return false;
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
        message: `${communityName.name} accepted your request.`,
      });
    } catch (err) {
      log('error', err.message);
    }
  };

  promoteEvent = async ({
    eventID,
    message,
    createdByAdmin,
  }: {
    eventID: string;
    message: string;
    createdByAdmin: string;
  }) => {
    try {
      const users = await User.model.find({}, '_id').exec();
      const promises = users.map((user) => {
        return Notifications.create({
          variant: 'general',
          forUser: user._id.toString(),
          relatedItemType: 'event',
          relatedItemId: eventID,
          actionProviderType: 'rootshare',
          actionProviderId: createdByAdmin,
          message,
        });
      });

      const values = await Promise.all(promises);
      return sendPacket(1, 'Successfully promoted post');
    } catch (err) {
      log('error', err.message);
      return sendPacket(-1, err.message);
    }
  };

  eventSpeakerInvite = async ({
    event,
    eventID,
    communityID,
    forUserID,
    isHost,
  }: {
    eventID?: ObjectIdType;
    event?: { _id: ObjectIdType; title: string; [k: string]: any };
    communityID?: ObjectIdType;
    forUserID: ObjectIdType;
    isHost?: boolean;
  }) => {
    try {
      let communityPromise: Query<ICommunity, ICommunity>;
      if (communityID)
        communityPromise = Community.model.findById(communityID, 'name');

      let eventPromise: Query<IWebinar, IWebinar>;
      if (eventID) eventPromise = Webinar.model.findById(eventID, 'title');

      const [community, eventFromPromise] = await Promise.all([
        communityPromise,
        eventPromise,
      ]);

      const eventToUse = eventFromPromise || event;

      const message = `You have been invited ${
        communityID ? `by ${community.name} ` : ''
      }to ${isHost ? 'host' : 'speak at'} an event.`;

      return Notifications.create({
        variant: 'event-speaker-invite',
        forUser: forUserID,
        relatedItemType: 'event',
        relatedItemId: eventToUse._id,
        actionProviderType: community ? 'community' : 'rootshare',
        actionProviderId: community ? communityID : 'rootshare',
        message,
      });
    } catch (err) {
      log('error', err.message);
      return false;
    }
  };

  rootshareMessage = async ({}: {}) => {};

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
