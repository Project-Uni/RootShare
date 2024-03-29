import { makeRequest } from '../../helpers/functions';

export type NotificationType = {
  _id: string;
  message: string;
  variant: string;
  createdAt: string;
  updatedAt: string;
  forUser: string;
  seen: boolean;
  relatedItemType: 'post' | 'event' | 'community' | 'user';
  relatedPost?: {
    _id: string;
    message: string;
  };
  relatedCommunity?: {
    _id: string;
    name: string;
    type: string;
    profilePicture?: string;
  };
  relatedEvent?: {
    _id: string;
    title: string;
    dateTime: string;
    eventImage?: string;
  };
  relatedUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  actionProviderType: 'user' | 'community' | 'rootshare';
  actionProviderUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  actionProviderCommunity?: {
    _id: string;
    name: string;
    type: string;
    profilePicture?: string;
  };
};

export type UnifiedNotification = {
  _id: string;
  message: string;
  variant: string;
  createdAt: string;
  updatedAt: string;
  forUser: string;
  seen: boolean;
  relatedItemType: 'post' | 'event' | 'community' | 'user';
  actionProviderType: 'user' | 'community' | 'rootshare';
  actionProvider?: { [key: string]: any; profilePicture?: string };
  relatedItem?: { [key: string]: any };
};

export const getNotifications = async () => {
  try {
    const { data } = await makeRequest<{ notifications: NotificationType[] }>(
      'GET',
      '/api/notifications'
    );

    if (data.success !== 1) return false;

    const notifications = unifyNotifications(data.content.notifications);
    return notifications;
  } catch (err) {
    return false;
  }
};

const unifyNotifications = (
  notifications: NotificationType[]
): UnifiedNotification[] => {
  return notifications.map((n) => {
    const {
      relatedCommunity,
      relatedPost,
      relatedEvent,
      relatedUser,
      actionProviderCommunity,
      actionProviderUser,
      ...rest
    } = n;
    let relatedItem:
      | NotificationType['relatedCommunity']
      | NotificationType['relatedEvent']
      | NotificationType['relatedPost']
      | NotificationType['relatedUser'];
    switch (n.relatedItemType) {
      case 'community':
        relatedItem = n.relatedCommunity;
        break;
      case 'user':
        relatedItem = n.relatedUser;
        break;
      case 'event':
        relatedItem = n.relatedEvent;
        break;
      case 'post':
        relatedItem = n.relatedPost;
        break;
      default:
    }

    let actionProvider:
      | NotificationType['actionProviderUser']
      | NotificationType['actionProviderCommunity'];

    switch (n.actionProviderType) {
      case 'user':
        actionProvider = n.actionProviderUser!;
        break;
      case 'community':
        actionProvider = n.actionProviderCommunity!;
        break;
      case 'rootshare':
      default:
    }

    return Object.assign({}, { actionProvider, relatedItem }, rest);
  });
};
