export type Community = {
  _id: string;
  name: string;
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
  members: number | any[];
  private: boolean;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
};
