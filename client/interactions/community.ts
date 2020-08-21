import sendPacket from '../helpers/sendPacket';
import log from '../helpers/logger';

import { Community } from '../models';
import { getCommunityValueFromType } from '../models/communities';
import { COMMUNITY_TYPE } from '../types/types';

export async function createNewCommunity(
  name: string,
  description: string,
  adminID: string,
  type: COMMUNITY_TYPE,
  isPrivate: boolean
) {
  const communityTypeValue = getCommunityValueFromType(type);
  if (!communityTypeValue) {
    return sendPacket(0, 'Invalid community type');
  }

  //TODO - Add check to see if community with same name already exists

  const newCommunity = new Community({
    name,
    description,
    type: communityTypeValue,
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
