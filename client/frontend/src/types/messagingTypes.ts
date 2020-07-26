export type MessageType = {
  _id: string;
  conversationID: string;
  senderName: string;
  sender: string;
  content: string;
  createdAt: Date;
  numLikes: number;
  liked: boolean;
};

export type ConversationType = {
  _id: string;
  participants?: any[];
  createdAt: Date;
  lastMessage?: string | MessageType;
};

export type LikeUpdateType = {
  messageID: string;
  numLikes: number;
};

// export type UserType = {

// }
