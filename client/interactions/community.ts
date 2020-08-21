import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';

import { Community } from '../models';

import { COMMUNITY_TYPE } from '../types/types';

export async function createNewCommunity(
  name: string,
  description: string,
  adminID: string,
  type: COMMUNITY_TYPE,
  isPrivate: boolean
) {
  //TODO - Add check to see if community with same name already exists

  const newCommunity = new Community({
    name,
    description,
    type,
    private: isPrivate,
    admin: adminID,
  });

  try {
    const savedCommunity = await newCommunity.save();

    log('info', `Successfully created community ${name}`);
    return sendPacket(1, 'Successfully created new community', {
      community: savedCommunity,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(0, `Failed to create community ${name}`);
  }
}

export async function retrieveAllCommunities() {
  try {
    const communities = await Community.find({}, [
      'name',
      'description',
      'admin',
      'private',
      'type',
      'university',
      'members', //TODO - Replace this with a count of all the members in the future
    ])
      .populate({ path: 'university', select: 'universityName' })
      .populate({
        path: 'admin',
        select: ['_id', 'firstName', 'lastName', 'email'],
      });

    log('info', `Retrieved ${communities.length} communities`);
    return sendPacket(1, 'Successfully retrieved all communities', { communities });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function editCommunity(
  _id: string,
  name: string,
  description: string,
  adminID: string,
  type: COMMUNITY_TYPE,
  isPrivate: boolean
) {
  try {
    const community = await Community.findById({ _id });
    community.name = name;
    community.description = description;
    community.admin = adminID;
    community.type = type;
    community.private = isPrivate;

    const savedCommunity = await community.save();
    log('info', `Successfully updated community ${name}`);
    return sendPacket(1, 'Successfully updated community', {
      community: savedCommunity,
    });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}

export async function getCommunityInformation(communityID: string) {
  try {
    const community = await Community.findById(communityID, [
      'name',
      'description',
      'admin',
      'private',
      'type',
      'members',
      'university',
      'profilePicture',
    ])
      .populate({ path: 'university', select: 'universityName' })
      .populate({
        path: 'admin',
        select: ['_id', 'firstName', 'lastName', 'email'],
      })
      .populate({ path: 'members', select: '_id' });
    log(
      'info',
      `Successfully retrieved community information for ${community.name}`
    );
    return sendPacket(1, 'Successfully retrieved community', { community });
  } catch (err) {
    log('error', err);
    return sendPacket(-1, err);
  }
}
