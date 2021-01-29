import mongoose = require('mongoose');
const Schema = mongoose.Schema;
type ObjectId = mongoose.Schema.Types.ObjectId;

import { CommunityType, CommunityMap } from '../helpers/types';
import { addProfilePicturesAll } from '../interactions/utilities';

const CommunitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      message: 'Name is required for community',
    },
    admin: { type: mongoose.Schema.ObjectId, ref: 'users', required: true },
    private: { type: Boolean, default: false, required: true },
    members: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'users' }],
      default: [],
    },
    pendingMembers: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'users' }],
      default: [],
    },
    type: { type: String, required: true, message: 'Type is required' },
    description: {
      type: String,
      required: true,
      message: 'Description is required.',
    },
    university: {
      type: mongoose.Schema.ObjectId,
      ref: 'universities',
      required: true,
      default: '5eb89c308cc6636630c1311f',
    },
    profilePicture: { type: String },
    bannerPicture: { type: String },
    //TODO - Add fields for background Image
    followedByCommunities: [
      { type: mongoose.Types.ObjectId, ref: 'community_edges' },
    ],
    followingCommunities: [
      { type: mongoose.Types.ObjectId, ref: 'community_edges' },
    ],
    outgoingPendingCommunityFollowRequests: [
      { type: mongoose.Types.ObjectId, ref: 'community_edges' },
    ],
    incomingPendingCommunityFollowRequests: [
      { type: mongoose.Types.ObjectId, ref: 'community_edges' },
    ],
    internalCurrentMemberPosts: [{ type: mongoose.Types.ObjectId, ref: 'posts' }],
    internalAlumniPosts: [{ type: mongoose.Types.ObjectId, ref: 'posts' }],
    externalPosts: [{ type: mongoose.Types.ObjectId, ref: 'posts' }],
    postsToOtherCommunities: [{ type: mongoose.Types.ObjectId, ref: 'posts' }],
    broadcastedPosts: [{ type: mongoose.Types.ObjectId, ref: 'posts' }],
    pinnedPosts: [{ type: mongoose.Types.ObjectId, ref: 'posts' }],
    isMTGFlag: { type: Boolean, default: false },
    // subcommunities: [{ type: mongoose.Types.ObjectId, ref: 'communities' }],
  },
  { timestamps: true }
);

mongoose.model('communities', CommunitySchema);
const Community = mongoose.model('communities');

export default Community;

export function getCommunityValueFromType(type: CommunityType) {
  return CommunityMap[type];
}

export function getCommunityTypeFromValue(value: number) {
  switch (value) {
    case 0:
      return 'Social';
    case 1:
      return 'Business';
    case 2:
      return 'Just for Fun';
    case 3:
      return 'Athletics';
    case 4:
      return 'Student Organization';
    case 5:
      return 'Academic';
    case 6:
      return 'Greek';
    default:
      return '';
  }
}

export type CommunityGetOptions = {
  includeDefaultFields?: boolean;
  populates?: { path: typeof CommunityC.Populate[number]; select: string }[];
  getProfilePicture?: boolean;
  getBannerPicture?: boolean;
  limit?: number;
  getRelationship?: string; //UserID to get relationship to
};

export class CommunityC {
  static DefaultFields = [
    'name',
    'description',
    'type',
    'private',
    'profilePicture',
  ] as const;

  static AcceptedFields = [
    ...CommunityC.DefaultFields,
    'admin',
    'members',
    'pendingMembers',
    'university',
    'followedByCommunities',
    'followingCommunities',
    'outgoingPendingCommunityFollowRequests',
    'incomingPendingCommunityFollowRequests',
    'internalCurrentMemberPosts',
    'internalAlumniPosts',
    'externalPosts',
    'postsToOtherCommunities',
    'broadcastedPosts',
  ] as const;

  static Populate = [
    'admin',
    'members',
    'followedByCommunities',
    'followingCommunities',
    'outgoingPendingCommunityFollowRequests',
    'incomingPendingCommunityFollowRequests',
    'internalCurrentMemberPosts',
    'internalAlumniPosts',
    'externalPosts',
    'postsToOtherCommunities',
    'broadcastedPosts',
  ];

  static DefaultOptions = {
    includeDefaultFields: true,
    getProfilePicture: true,
  };

  static create = async (params: {
    name: string;
    admin: string;
    private: boolean;
    description: string;
    type: string;
    university: string;
  }) => {
    const community = await new Community({ ...params }).save();
    return community;
  };

  static getByIDs = async (
    _ids: string[],
    params?: {
      fields?: typeof CommunityC.AcceptedFields[number][];
      options?: CommunityGetOptions;
    }
  ) => {
    const { fields: fieldsParam, options: optionsParam } = params;

    //Preparation
    const options: CommunityGetOptions = {
      ...CommunityC.DefaultOptions,
      ...(optionsParam || {}),
    };
    const fields = (fieldsParam || []).filter((field) =>
      CommunityC.AcceptedFields.includes(field)
    );
    if (options.includeDefaultFields) {
      fields.push(
        ...[...CommunityC.DefaultFields].filter((field) => fields.includes(field))
      );
    }
    const populates = options.populates?.slice() || [];

    //Relationship prep
    const removeFields = {
      members: false,
      pendingMembers: false,
      admin: false,
    };

    if (options.getRelationship) {
      if (fields.indexOf('members') === -1) {
        fields.push('members');
        removeFields.members = true;
      }
      if (fields.indexOf('pendingMembers') === -1) {
        fields.push('pendingMembers');
        removeFields.pendingMembers = true;
      }
      if (fields.indexOf('admin') === -1) {
        fields.push('admin');
        removeFields.admin = true;
      }
    }

    //Retrieval
    let result = Community.find({ _id: { $in: _ids } }, fields);
    if (options.limit) result = result.limit(options.limit);
    populates.forEach((populateAction) => {
      result = result.populate(populateAction);
    });
    const output = await result.lean().exec();

    //Post Retrieval
    const promises: Promise<any>[] = [];
    if (options.getProfilePicture)
      promises.push(addProfilePicturesAll(output, 'communityProfile'));
    if (options.getBannerPicture) {
      //TODO - Get Banner Picture
    }
    if (options.getRelationship)
      getUserToCommunityRelationship_V2(options.getRelationship, output);

    await Promise.all(promises);

    const cleanedOutput = Object.keys(removeFields).some((k) => removeFields[k])
      ? output.map((community) => {
          const communityDelta = Object.assign({}, community);
          Object.keys(removeFields).forEach((key) => {
            if (removeFields[key]) delete communityDelta[key];
          });

          return communityDelta;
        })
      : output;

    return cleanedOutput;
  };
}

export const getUserToCommunityRelationship_V2 = async (
  userID: string,
  communities: {
    _id: ObjectId;
    members: ObjectId[];
    pendingMembers: ObjectId[];
    admin: ObjectId;
    [k: string]: unknown;
  }[]
) => {
  communities.forEach((community) => {
    if (community.admin.equals(userID)) community.relationship = 'admin';
    else if (community.members.some((memberID) => memberID.equals(userID)))
      community.relationship = 'joined';
    else if (community.pendingMembers.some((memberID) => memberID.equals(userID)))
      community.relationship = 'pending';
    else community.relationship = 'open';
  });
};
