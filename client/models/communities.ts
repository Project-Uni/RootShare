const mongoose = require('mongoose');
import { COMMUNITY_TYPE, CommunityMap } from '../types/types';

const CommunitySchema = new mongoose.Schema(
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
    type: { type: Number, required: true, message: 'Type is required' },
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
    //TODO - Add fields for background Image
  },
  { timestamps: true }
);

mongoose.model('communities', CommunitySchema);
const Community = mongoose.model('communities');

export default Community;

export function getCommunityValueFromType(type: COMMUNITY_TYPE) {
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
    default:
      return '';
  }
}
