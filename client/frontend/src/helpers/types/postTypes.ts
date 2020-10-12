export type PostType = {
  [key: string]: any;
  _id: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  fromCommunity: { name: string; _id: string; profilePicture?: string };
  toCommunity: { name: string; _id: string; profilePicture?: string };
  type: 'broadcast' | 'external' | 'internalCurrent' | 'internalAlumni';
  anonymous?: boolean;
};
