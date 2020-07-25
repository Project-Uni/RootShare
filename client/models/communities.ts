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
    events: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'webinars' }],
      required: true,
      default: [],
    },
    //TODO - Add fields for profile pic and background Image
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
