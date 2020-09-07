import { UserType } from './userTypes';

export type MessageType = {
  _id: string;
  conversationID: string | ConversationType;
  senderName: string;
  sender: string | UserType[];
  content: string;
  createdAt: Date;
  numLikes: number;
  liked: boolean;
  error: boolean;
  tempID: string;
};

export type ConversationType = {
  _id: string;
  participants: string[] | UserType[];
  createdAt: Date;
  lastMessage: string | MessageType;
};

export type LikeUpdateType = {
  messageID: string | MessageType;
  liked: boolean;
  numLikes: number;
  liker: string;
  likerName: string;
};
