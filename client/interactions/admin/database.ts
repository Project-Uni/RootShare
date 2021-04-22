import { FilterQuery, Model as MongooseModel } from 'mongoose';
import { log, sendPacket } from '../../helpers/functions';
import {
  Comment,
  Community,
  CommunityEdge,
  Connection,
  Conversation,
  Document,
  ExternalCommunication,
  ExternalLink,
  Image,
  MeetTheGreekInterest,
  Message,
  Notifications,
  PhoneVerification,
  Post,
  Search,
  University,
  User,
  Webinar,
} from '../../rootshare_db/models';

export class AdminDatabase {
  find = async ({
    model,
    select,
    query,
    populates,
    limit,
    sort,
  }: {
    model: Model;
    select: string;
    query: FilterQuery<any>;
    populates?: {
      path: string;
      select: string;
      populate?: {
        path: string;
        select: string;
      }; //For Community Edge and connection
    }[];
    limit?: number;
    sort?: { [k: string]: 1 | -1 };
  }) => {
    if (!select) return sendPacket(-1, 'Select is required.');

    const db = AdminDatabase.getModel(model);
    if (!db) return sendPacket(-1, 'Invalid Model');

    try {
      let action = (db.model as MongooseModel<any>).find(query, select);

      if (sort) action = action.sort(sort);
      if (limit) action = action.limit(limit);

      if (populates) {
        populates.forEach((p) => {
          action = action.populate(p);
        });
      }

      const data = await action.lean().exec();

      if (!data) return sendPacket(0, 'Failed to retrieve data');

      return sendPacket(1, 'Successfully retrieved data', { data });
    } catch (error) {
      log('error', error);
      return sendPacket(-1, 'Failed with error', { error });
    }
  };

  private static getModel = (model: Model) => {
    switch (model) {
      case 'comment':
        return Comment;
      case 'community':
        return Community;
      case 'communityEdge':
        return CommunityEdge;
      case 'connection':
        return Connection;
      case 'conversation':
        return Conversation;
      case 'document':
        return Document;
      case 'externalCommunication':
        return ExternalCommunication;
      case 'externalLink':
        return ExternalLink;
      case 'image':
        return Image;
      case 'meetTheGreekInterest':
        return MeetTheGreekInterest;
      case 'message':
        return Message;
      case 'notification':
        return Notifications;
      case 'phone_verification':
        return PhoneVerification;
      case 'post':
        return Post;
      case 'search':
        return Search;
      case 'university':
        return University;
      case 'user':
        return User;
      case 'webinar':
        return Webinar;
      default:
        return false;
    }
  };
}

export const Models = [
  'comment',
  'community',
  'communityEdge',
  'connection',
  'conversation',
  'document',
  'externalCommunication',
  'externalLink',
  'image',
  'meetTheGreekInterest',
  'message',
  'notification',
  'phone_verification',
  'post',
  'search',
  'university',
  'user',
  'webinar',
] as const;

export type Model = typeof Models[number];
