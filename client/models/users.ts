import { addProfilePicturesAll } from '../interactions/utilities';

import mongoose = require('mongoose');
const Schema = mongoose.Schema;
type ObjectId = mongoose.Schema.Types.ObjectId;

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

export const AcceptedFields = [
  ...DefaultFields,
  'university',
  'privilegeLevel',
  // 'hashedPassword', //We need to find a way to only be able to read this in certain cases, dont want this getting sent out on a rogue get request
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

export type GetUsersByIDsOptions = {
  includeDefaultFields?: boolean;
  limit?: number;
  populates?: { path: typeof Populate[number]; select: string }[];
  getProfilePicture?: boolean;
  getBannerPicture?: boolean;
  getRelationship?: string; //UserID to get relationship to
};

export const getUsersByIDs = async (
  _ids: string[],
  params: {
    fields?: typeof AcceptedFields[number][];
    options?: GetUsersByIDsOptions;
  }
) => {
  const { fields: fieldsParam, options: optionsParam } = params;

  const options: typeof params.options = {
    includeDefaultFields: true,
    getProfilePicture: true,
    ...(optionsParam || {}),
  };

  const populates = options.populates?.slice() || [];

  const fields = (fieldsParam || []).filter((field) =>
    AcceptedFields.includes(field)
  );
  if (options.includeDefaultFields) {
    fields.push(...[...DefaultFields].filter((field) => fields.includes(field)));
  }

  let removeConnectionsField = false;
  let removePendingConnectionsField = false;

  if (options.getRelationship) {
    if (fields.indexOf('connections') === -1) {
      fields.push('connections');
      removeConnectionsField = true;
    }
    if (fields.indexOf('pendingConnections') === -1) {
      fields.push('pendingConnections');
      removePendingConnectionsField = true;
    }

    let populatesHasPendingConnections;
    for (let i = 0; i < populates.length; i++) {
      if (populates[i].path === 'pendingConnections')
        populatesHasPendingConnections = true;
    }

    if (!populatesHasPendingConnections)
      populates.push({ path: 'pendingConnections', select: 'from to' });
  }

  let result = User.find({ _id: { $in: _ids } }, fields);

  if (options.limit) result = result.limit(options.limit);

  populates.forEach((populateAction) => {
    result = result.populate(populateAction);
  });

  const output = await result.lean().exec();

  const promises: Promise<any>[] = [];
  if (options.getProfilePicture)
    promises.push(addProfilePicturesAll(output, 'profile'));
  if (options.getRelationship) {
    promises.push(getUserToUserRelationship_V2(options.getRelationship, output));
  }

  await Promise.all(promises);
  const cleanedOutput =
    removeConnectionsField || removePendingConnectionsField
      ? output.map((user) => {
          const userDelta = Object.assign({}, user);
          if (removeConnectionsField) delete userDelta.connections;
          if (removePendingConnectionsField) delete userDelta.pendingConnections;
          return userDelta;
        })
      : output;
  return cleanedOutput;
};

export const getUserToUserRelationship_V2 = async (
  userID: string,
  users: {
    [key: string]: any;
    _id: ObjectId;
    pendingConnections: { from: ObjectId; to: ObjectId; _id: ObjectId }[];
    connections: string[];
  }[]
) => {
  const user = await User.findById(userID)
    .select(['connections', 'pendingConnections'])
    .populate({ path: 'pendingConnections', select: 'from to' })
    .exec();

  users.forEach((otherUser) => {
    if (otherUser._id.equals(userID)) otherUser.relationship = 'self';
    else if (
      otherUser.connections.some((user2connection) =>
        user.connections.includes(user2connection)
      )
    ) {
      otherUser.relationship = 'connected';
    } else {
      const pendingConnectionIntersection = otherUser.pendingConnections.filter(
        (user2Connection) =>
          user.pendingConnections.some((user1Connection) =>
            user2Connection._id.equals(user1Connection._id)
          )
      );
      if (pendingConnectionIntersection.length > 0) {
        const pendingConnection = pendingConnectionIntersection[0];
        if (pendingConnection.from.equals(userID))
          otherUser.relationship = 'pending_to';
        else otherUser.relationship = 'pending_from';
      } else {
        otherUser.relationship = 'open';
      }
    }
  });
};
