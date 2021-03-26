import { UserType, PostType } from '.';

export type SINGLE_DIGIT = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SnackbarMode = 'success' | 'notify' | 'error';

export type ImageType = {
  _id: string;
  user: string | UserType;
  post: string | PostType;
  imageType: string;
  fileName: string;
  createdAt: Date;
  updatedAt: Date;
};
