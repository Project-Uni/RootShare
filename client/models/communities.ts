const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 *
 * @swagger
 *  components:
 *    schemas:
 *      Community:
 *        type: object
 *        required:
 *          - name
 *          - admin
 *          - private
 *          - type
 *          - description
 *          - university
 *        properties:
 *          _id:
 *            type: string
 *            description: Auto-generated ID
 *          name:
 *            type: string
 *            description: The name of the community
 *          admin:
 *            $ref: '#/components/schemas/User'
 *            description: The admin of the community
 *          private:
 *            type: boolean
 *            description: Whether or not the community is private
 *          members:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: All the members of the community
 *          pendingMembers:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *            description: The members who have requested membership to the community
 *          description:
 *            type: string
 *            description: The description for what the community is for
 *          university:
 *            $ref: '#/components/schemas/University'
 *            description: The university the community belongs to
 *          profilePicture:
 *            type: string
 *            description: The file for the community's profile picture
 *          bannerPicture:
 *            type: string
 *            description: The file for the community's banner image
 *          followedByCommunities:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/CommunityEdge'
 *            description: The communities this community is followed by
 *          followingCommunities:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/CommunityEdge'
 *            description: The communities this community is following
 *          outgoingPendingCommunityFollowRequests:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/CommunityEdge'
 *            description: The communities this community requested to follow
 *          incomingPendingCommunityFollowRequests:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/CommunityEdge'
 *            description: The communities this community received follow requests from
 *          internalCurrentMemberPosts:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Post'
 *            description: The posts made by current members to this community
 *          internalAlumniPosts:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Post'
 *            description: The posts made by alumni to this community
 *          externalPosts:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Post'
 *            description: Posts made externally by/to this community
 *          postsToOtherCommunities:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Post'
 *            description: The posts this community made to other communities
 *          broadcastedPosts:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Post'
 *            description: The posts this community broadcast to the university
 *          pinnedPosts:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Post'
 *            description: The posts pinned by this community
 *          isMTGFlag:
 *            type: boolean
 *            description: Flag for communities that participated in MTG
 *          createdAt:
 *            type: string
 *            format: date-time
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date-time
 *            description: When the record was last updated
 *        example:
 *          _id: 0123456789abcdef
 *          name: Rho Sigma
 *          admin: 1123456789abcdef
 *          private: true
 *          members: [2123456789abcdef, 3123456789abcdef]
 *          pendingMembers: [4123456789abcdef]
 *          description: The Greek RootShare community
 *          university: 5123456789abcdef
 *          profilePicture: 0123456789abcdef_profile.jpeg
 *          bannerPicture: 0123456789abcdef_profile.jpeg
 *          followedByCommunities: [6123456789abcdef]
 *          followingCommunities: [7123456789abcdef]
 *          outgoingPendingCommunityFollowRequests: [8123456789abcdef]
 *          incomingPendingCommunityFollowRequests: [9123456789abcdef]
 *          internalCurrentMemberPosts: [a123456789abcdef]
 *          internalAlumniPosts: [b123456789abcdef]
 *          externalPosts: [c123456789abcdef]
 *          postsToOtherCommunities: [d123456789abcdef]
 *          broadcastedPosts: [e123456789abcdef]
 *          pinnedPosts: [f123456789abcdef]
 *          isMTGFlag: false
 *
 */

import { Types } from 'mongoose';
type ObjectId = Types.ObjectId;

import { CommunityType, CommunityMap, U2CR } from '../helpers/types';
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
  static model = Community;

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
      CommunityC.getUserToCommunityRelationship_V2(options.getRelationship, output);

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

  static getByUniveristy = async (
    univeristy: string,
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
    let result = Community.find({ university: { $in: univeristy } }, fields);
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
      CommunityC.getUserToCommunityRelationship_V2(options.getRelationship, output);

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

  static getUserToCommunityRelationship_V2 = async (
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
      if (community.admin.equals(userID)) community.relationship = U2CR.ADMIN;
      else if (community.members.some((memberID) => memberID.equals(userID)))
        community.relationship = U2CR.JOINED;
      else if (community.pendingMembers.some((memberID) => memberID.equals(userID)))
        community.relationship = U2CR.PENDING;
      else community.relationship = U2CR.OPEN;
    });
  };
}
