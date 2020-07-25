export type MessageType = {
  _id: string;
  conversationID: string;
  senderName: string;
  sender: string;
  content: string;
  createdAt: Date;
  numLikes: number;
};

export type ConversationType = {
  _id: string;
  participants?: any[];
  createdAt: Date;
  lastMessage?: string | MessageType;
};

// export type UserType = {

// }
