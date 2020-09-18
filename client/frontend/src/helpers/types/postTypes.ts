export type PostType = {
  [key: string]: any;
  _id: string;
  createdAt: string;
  likes: number;
  user: { [key: string]: any };
};
