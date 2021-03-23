import { model, Schema, Document, Types } from 'mongoose';
import { retrieveSignedUrl } from '../helpers/functions';

const ObjectIdVal = Types.ObjectId;
type ObjectIdType = Types.ObjectId;

type NotificationVariant =
  | 'like'
  | 'comment'
  | 'connection-accept'
  | 'community-invite'
  | 'community-accept'
  | 'general'; //Add other types here

type NotificationRelatedItem = 'post' | 'event' | 'community' | 'user';
type NotificationActionProvider = 'user' | 'community' | 'rootshare';

type IUser = {
  _id: string;
  [k: string]: unknown;
};

type IPost = {
  _id: string;
  [k: string]: unknown;
};

type ICommunity = {
  _id: string;
  [k: string]: unknown;
};

type IEvent = {
  _id: string;
  [k: string]: unknown;
};

export interface INotification extends Document {
  _id: ObjectIdType;
  variant: NotificationVariant;
  seen: boolean;
  forUser: IUser['_id'] | IUser;
  relatedItemType: NotificationRelatedItem;
  relatedPost: undefined | IPost | IPost['_id'];
  relatedCommunity: undefined | ICommunity | ICommunity['_id'];
  relatedEvent: undefined | IEvent | IEvent['_id'];
  relatedUser: undefined | IUser | IUser['_id'];
  actionProviderType: NotificationActionProvider;
  actionProviderUser: undefined | IUser | IUser['_id'];
  actionProviderCommunity: undefined | ICommunity | ICommunity['_id'];
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    variant: { type: String, required: true },
    seen: { type: Boolean, default: false },
    forUser: { type: ObjectIdVal, ref: 'users', required: true },
    relatedItemType: { type: String, required: true },
    relatedPost: { type: ObjectIdVal, ref: 'posts' },
    relatedCommunity: { type: ObjectIdVal, ref: 'communities' },
    relatedEvent: { type: ObjectIdVal, ref: 'webinars' },
    relatedUser: { type: ObjectIdVal, ref: 'users' },
    actionProviderType: { type: String, required: true, default: 'rootshare' },
    actionProviderUser: { type: ObjectIdVal, ref: 'users' },
    actionProviderCommunity: { type: ObjectIdVal, ref: 'communities' },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

model('notifications', NotificationSchema);
const NotificationsModel = model<INotification>('notifications');

type IFindNotificationsForUser = {
  message: string;
  variant: NotificationVariant;
  createdAt: Date;
  updatedAt: Date;
  forUser: string;
  seen: boolean;
  relatedItemType: NotificationRelatedItem;
  relatedPost?: {
    _id: ObjectIdType;
    message: string;
  };
  relatedCommunity?: {
    _id: ObjectIdType;
    name: string;
    type: string;
    profilePicture?: string;
  };
  relatedEvent?: {
    _id: ObjectIdType;
    title: string;
    dateTime: Date;
    eventImage?: string;
  };
  relatedUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  actionProviderType: NotificationActionProvider;
  actionProviderUser?: {
    _id: ObjectIdType;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  actionProviderCommunity?: {
    _id: ObjectIdType;
    name: string;
    type: string;
    profilePicture?: string;
  };
};

export default class Notifications {
  static model = NotificationsModel;

  static create = async ({
    variant,
    message,
    forUser,
    relatedItemId,
    relatedItemType,
    actionProviderId,
    actionProviderType,
  }: {
    variant: NotificationVariant;
    message: string;
    forUser: string;
    relatedItemType: NotificationRelatedItem;
    relatedItemId: string;
    actionProviderType: NotificationActionProvider;
    actionProviderId: string;
  }) => {
    const newNotification = await new Notifications.model({
      message,
      forUser,
      relatedItemType,
      actionProviderType,
      variant,
      relatedPost: relatedItemType === 'post' ? relatedItemId : undefined,
      relatedCommunity: relatedItemType === 'community' ? relatedItemId : undefined,
      relatedEvent: relatedItemType === 'event' ? relatedItemId : undefined,
      relatedUser: relatedItemType === 'user' ? relatedItemId : undefined,
      actionProviderUser:
        actionProviderType === 'user' ? actionProviderId : undefined,
      actionProviderCommunity:
        actionProviderType === 'community' ? actionProviderId : undefined,
    }).save();

    return newNotification;
  };

  static findForUser = async ({
    userID,
  }: {
    userID: string;
  }): Promise<IFindNotificationsForUser[]> => {
    const notifications = ((await Notifications.model
      .aggregate([
        {
          $match: {
            forUser: ObjectIdVal(userID),
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 30 },
        {
          $lookup: {
            from: 'users',
            localField: 'actionProviderUser',
            foreignField: '_id',
            as: 'actionProviderUser',
          },
        },
        {
          $lookup: {
            from: 'communities',
            localField: 'actionProviderCommunity',
            foreignField: '_id',
            as: 'actionProviderCommunity',
          },
        },
        {
          $lookup: {
            localField: 'relatedPost',
            foreignField: '_id',
            from: 'posts',
            as: 'relatedPost',
          },
        },
        {
          $lookup: {
            localField: 'relatedCommunity',
            foreignField: '_id',
            from: 'communities',
            as: 'relatedCommunity',
          },
        },
        {
          $lookup: {
            localField: 'relatedEvent',
            foreignField: '_id',
            from: 'webinars',
            as: 'relatedEvent',
          },
        },
        {
          $lookup: {
            localField: 'relatedUser',
            foreignField: '_id',
            from: 'users',
            as: 'relatedUser',
          },
        },
        {
          $unwind: {
            path: '$actionProviderUser',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$actionProviderCommunity',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$relatedPost',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$relatedCommunity',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$relatedEvent',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$relatedUser',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: '$_id',
            message: '$message',
            variant: '$variant',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            forUser: '$forUser',
            seen: '$seen',
            relatedItemType: '$relatedItemType',
            relatedPost: {
              _id: '$relatedPost._id',
              message: '$relatedPost.message',
            },
            relatedCommunity: {
              _id: '$relatedCommunity._id',
              name: '$relatedCommunity.name',
              type: '$relatedCommunity.type',
              profilePicture: '$relatedCommunity.profilePicture',
            },
            relatedEvent: {
              _id: '$relatedEvent._id',
              title: '$relatedEvent.title',
              dateTime: '$relatedEvent.dateTime',
              eventImage: '$relatedEvent.eventImage',
            },
            relatedUser: {
              _id: '$relatedUser._id',
              firstName: '$relatedUser.firstName',
              lastName: '$relatedUser.lastName',
              profilePicture: '$relatedUser.profilePicture',
            },
            actionProviderType: '$actionProviderType',
            actionProviderUser: {
              _id: '$actionProviderUser._id',
              firstName: '$actionProviderUser.firstName',
              lastName: '$actionProviderUser.lastName',
              profilePicture: '$actionProviderUser.profilePicture',
            },
            actionProviderCommunity: {
              _id: '$actionProviderCommunity._id',
              name: '$actionProviderCommunity.name',
              type: '$actionProviderCommunity.type',
              profilePicture: '$actionProviderCommunity.profilePicture',
            },
          },
        },
      ])
      .exec()) as unknown) as IFindNotificationsForUser[];

    await Notifications.addImages(notifications);
    return notifications;
  };

  static markAsSeen = async ({
    _ids,
    userID,
  }: {
    _ids: string[];
    userID: string;
  }) => {
    await Notifications.model
      .updateMany(
        { $and: [{ _id: { $in: _ids } }, { forUser: userID }], seen: false },
        { seen: true }
      )
      .exec();
    return true;
  };

  private static addImages = async (notifications: IFindNotificationsForUser[]) => {
    const promises = notifications.map((n) => {
      switch (n.relatedItemType) {
        case 'user':
          return Notifications.getImage.user(n);
        case 'community':
          return Notifications.getImage.community(n);
        case 'event':
          return Notifications.getImage.event(n);
        case 'post':
        default:
          return null;
      }
    });
    const images = await Promise.all(promises);
    for (let i = 0; i < notifications.length; i++) {
      const n = notifications[i];
      if (images[i]) {
        const img = images[i] as string;
        switch (n.relatedItemType) {
          case 'user':
            if (n.relatedUser) n.relatedUser.profilePicture = img;
            break;
          case 'community':
            if (n.relatedCommunity) n.relatedCommunity.profilePicture = img;
            break;
          case 'event':
            if (n.relatedEvent) n.relatedEvent.eventImage = img;
            break;
          case 'post':
          default:
        }
      }
    }
  };

  private static getImage = {
    user: async (notification: IFindNotificationsForUser) => {
      if (notification.relatedUser?.profilePicture)
        return retrieveSignedUrl('profile', notification.relatedUser.profilePicture);
    },

    community: async (notification: IFindNotificationsForUser) => {
      if (notification.relatedCommunity?.profilePicture)
        return retrieveSignedUrl(
          'communityProfile',
          notification.relatedCommunity.profilePicture
        );
    },

    event: async (notification: IFindNotificationsForUser) => {
      if (notification.relatedEvent?.eventImage)
        return retrieveSignedUrl('eventImage', notification.relatedEvent.eventImage);
    },
  };
}
