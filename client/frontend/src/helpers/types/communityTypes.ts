export type Community = {
  _id: string;
  name: string;
  description: string;
  admin: {
    [key: string]: any;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  university: {
    _id: string;
    universityName: string;
  };
  members: any[]; //TODO - This might change
  private: boolean;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
};
