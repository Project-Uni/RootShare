import { model, Schema, Document, Types } from 'mongoose';

const ObjectIdVar = Types.ObjectId;
type ObjectIdType = Types.ObjectId;

type NotificationVariant =
  | 'like'
  | 'comment'
  | 'connection-accept'
  | 'community-invite'
  | 'community-accept'
  | 'general'; //Add other types here

type NotificationRelatedItem = 'post' | 'event' | 'community' | 'connection';
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
  relatedConnection: undefined | IUser | IUser['_id'];
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
    forUser: { type: ObjectIdVar, ref: 'users', required: true },
    relatedItemType: { type: String, required: true },
    relatedPost: { type: ObjectIdVar, ref: 'posts' },
    relatedCommunity: { type: ObjectIdVar, ref: 'communities' },
    relatedEvent: { type: ObjectIdVar, ref: 'webinars' },
    relatedConnection: { type: ObjectIdVar, ref: 'users' },
    actionProviderType: { type: String, required: true, default: 'rootshare' },
    actionProviderUser: { type: ObjectIdVar, ref: 'users' },
    actionProviderCommunity: { type: ObjectIdVar, ref: 'communities' },
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
    eventBanner?: string;
  };
  relatedConnection?: {
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
      relatedConnection:
        relatedItemType === 'connection' ? relatedItemId : undefined,
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
    const notifications = await Notifications.model
      .aggregate([
        { $match: { forUser: userID } },
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
            localField: 'relatedConnection',
            foreignField: '_id',
            from: 'users',
            as: 'relatedConnection',
          },
        },
        {
          $unwind: { path: '$actionProviderUser', preserveNullAndEmpyArrays: true },
        },
        {
          $unwind: {
            path: '$actionProviderCommunity',
            preserveNullAndEmpyArrays: true,
          },
        },
        { $unwind: { path: '$relatedPost', preserveNullAndEmpyArrays: true } },
        { $unwind: { path: '$relatedCommunity', preserveNullAndEmpyArrays: true } },
        { $unwind: { path: '$relatedEvent', preserveNullAndEmpyArrays: true } },
        { $unwind: { path: '$relatedConnection', preserveNullAndEmpyArrays: true } },
        {
          $project: {
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
              eventBanner: '$relatedEvent.banner',
            },
            relatedConnection: {
              _id: '$relatedConnection._id',
              firstName: '$relatedConnection.firstName',
              lastName: '$relatedConnection.lastName',
              profilePicture: '$relatedConnection.profilePicture',
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
      .exec();

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

  private static addImages = async (notifications) => {};

  private static getUserImages = async () => {};
  private static getCommunityImages = async () => {};
  private static getEventImages = async () => {};
}
