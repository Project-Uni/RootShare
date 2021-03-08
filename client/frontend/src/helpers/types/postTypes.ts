export type PostType = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  message: string;
  likes: number;
  liked: boolean;
  comments: number;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    major?: string;
    graduationYear: number;
    work?: string;
    position?: string;
  };
  images: { fileName: string }[];
  fromCommunity?: { name: string; _id: string; profilePicture?: string };
  toCommunity?: { name: string; _id: string; profilePicture?: string };
  type: 'broadcast' | 'external' | 'internalCurrent' | 'internalAlumni';
  anonymous?: boolean;
};

export type CommunityPostingOption = {
  description: string;
  routeSuffix: string;
  communityID?: string;
  profilePicture?: string;
};
