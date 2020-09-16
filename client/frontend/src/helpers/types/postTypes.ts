export type PostType = {
  [key: string]: any;
  createdAt: string;
  likes: number;
  user: { [key: string]: any };
};
