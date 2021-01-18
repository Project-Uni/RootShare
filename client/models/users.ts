import { addProfilePicturesAll } from '../interactions/utilities';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - firstName
 *          - lastName
 *          - email
 *          - university
 *          - createdAt
 *          - updatedAt
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated id
 *          firstName:
 *            type: string
 *            description: First name of user
 *          lastName:
 *            type: string
 *            description: Last name of user
 *          email:
 *            type: string
 *            description: Email of user
 *          accountType:
 *            type: string
 *            description: Student, Alumni, Faculty, or Fan
 *          privilegeLevel:
 *            type: number
 *            description: Determines what features the user can access. Current options (1=regular[default], 6=admin, 9=super admin)
 *          hashedPassword:
 *            type: string
 *            description: Hashed password of the user
 *          googleID:
 *            type: string
 *            description: googleID of the user, used for login with google
 *          linkedinID:
 *            type: string
 *            description: linkedinID of the user, used for login with linkedIn
 *          graduationYear:
 *            type: number
 *            description: Graduation year of the user
 *          major:
 *            type: string
 *          phoneNumber:
 *            type: string
 *          organizations:
 *            type: array
 *            items:
 *              type: string
 *            description: user inputted communities they are a part of
 *          work:
 *            type: string
 *            description: The company the user currently works at
 *          position:
 *            type: string
 *            description: The user's current job title
 *          interests:
 *            type: array
 *            items:
 *              type: string
 *            description: The user's interests
 *          discoveryMethod:
 *            type: string
 *          bio:
 *            type: string
 *          attendedWebinars:
 *            type: array
 *            items:
 *              type: string
 *            description: ID's of all webinars the user has attended
 *          connections:
 *            type: array
 *            items:
 *              type: string
 *            description: ID's of all connections Objects the user is connected with
 *          pendingConnections:
 *            type: array
 *            items:
 *              type: string
 *            description: ID's of all pending connection Objects
 *          joinedCommunities:
 *            type: array
 *            items:
 *              type: string
 *            description: ID's of all communities the user has joined
 *          pendingCommunities:
 *            type: array
 *            items:
 *              type: string
 *            description: ID's of all communities the user has requested to join
 *          broadcastedPosts:
 *            type: array
 *            items:
 *              type: string
 *            description: ID's of all posts the user has broadcasted
 *          communityPosts:
 *            type: array
 *            items:
 *              type: string
 *            description: ID's of all posts sent to a community by the user
 *          likes:
 *            type: array
 *            items:
 *              type: string
 *            description: ID's of all posts the user has liked
 *          profilePicture:
 *            type: string
 *            description: File name of user's current profile picture
 *          bannerPicture:
 *            type: string
 *            description: File name of user's current banner picture
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: When the record was last updated
 *        example:
 *          firstName: 'John'
 *          lastName: 'Doe'
 *          email: 'johndoe@email.com'
 *
 */

var userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    university: {
      type: Schema.ObjectId,
      ref: 'universities',
      required: true,
      default: '5eb89c308cc6636630c1311f',
    },
    accountType: { type: String },
    privilegeLevel: { type: Number, default: 1 },
    hashedPassword: String,
    googleID: String,
    linkedinID: String,
    graduationYear: Number,
    department: String,
    major: String,
    phoneNumber: String,
    organizations: Array,
    work: String,
    position: String,
    interests: Array,
    graduateSchool: String,
    discoveryMethod: String,
    bio: String,
    sendEmails: { type: Boolean, required: true, default: true },
    confirmed: { type: Boolean, required: true, default: false },
    verified: { type: Boolean, required: true, default: false },
    RSVPWebinars: {
      type: [{ type: Schema.ObjectId, ref: 'webinars' }],
    },
    attendedWebinars: {
      type: [{ type: Schema.ObjectId, ref: 'webinars' }],
    },
    connections: {
      type: [{ type: Schema.ObjectId, ref: 'connections' }],
    },
    pendingConnections: {
      type: [{ type: Schema.ObjectId, ref: 'connections' }],
    },
    joinedCommunities: {
      type: [{ type: Schema.ObjectId, ref: 'communities' }],
    },
    pendingCommunities: {
      type: [{ type: Schema.ObjectId, ref: 'communities' }],
    },
    profilePicture: { type: String },
    bannerPicture: { type: String },
    broadcastedPosts: {
      type: [{ type: Schema.ObjectId, ref: 'posts' }],
    },
    communityPosts: {
      type: [{ type: Schema.ObjectId, ref: 'posts' }],
    },
    likes: {
      type: [{ type: Schema.ObjectId, ref: 'posts' }],
    },
  },
  { timestamps: true }
);

mongoose.model('users', userSchema);
const User = mongoose.model('users');

export default User;

const DefaultFields = [
  'firstName',
  'lastName',
  'email',
  'accountType',
  'major',
  'graduationYear',
  'profilePicture',
  'work',
  'position',
] as const;

const AcceptedFields = [
  ...DefaultFields,
  'university',
  'privilegeLevel',
  'hashedPassword',
  'googleID',
  'linkedinID',
  'phoneNumber',
  'organizations',
  'interests',
  'bio',
  'attendedWebinars',
  'connections',
  'pendingConnections',
  'joinedCommunities',
  'pendingCommunities',
  'bannerPicture',
  'broadcastedPosts',
  'communityPosts',
] as const;

const Populate = [
  'attendedWebinars',
  'connections',
  'pendingConnections',
  'joinedCommunities',
  'pendingCommunities',
  'broadcastedPosts',
  'communityPosts',
  'likes',
] as const;

export const getUsersByIDs = async (
  _ids: string[],
  params: {
    fields: typeof AcceptedFields[number][];
    options: {
      includeDefaultFields?: boolean;
      lean?: boolean;
      limit?: number;
      populates?: { path: typeof Populate[number]; select: string }[];
      getProfilePicture?: boolean;
      getBannerPicture?: boolean;
    };
  } = { fields: [...DefaultFields], options: {} }
) => {
  const { fields, options: optionParams } = params;
  const options: typeof params.options = {
    includeDefaultFields: true,
    lean: true,
    getProfilePicture: true,
    ...optionParams,
  };

  let result = User.find({ _id: { $in: _ids } }, fields);
  if (options.limit) result = result.limit(options.limit);
  options.populates?.forEach((populateAction) => {
    result = result.populate(populateAction);
  });
  if (options.lean) result = result.lean();

  const output = await result.exec();
  if (options.getProfilePicture) {
    await addProfilePicturesAll(output, 'profile');
  }
  return output;
};
