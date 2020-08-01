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
};

export type ConversationType = {
  _id: string;
  participants: string[] | UserType[];
  createdAt: Date;
  lastMessage: string | MessageType;
};

export type LikeUpdateType = {
  messageID: string | MessageType;
  numLikes: number;
};

// export type UserType = {

// }
