import { Types } from 'mongoose';

import { User, Community, ExternalLink } from '../rootshare_db/models';
import { LinkEntityType, LinkType } from '../rootshare_db/types';

import { sendPacket } from '../helpers/functions';

type ObjectIdType = Types.ObjectId;

export async function uploadLinks(
  userID: ObjectIdType,
  entityID: ObjectIdType,
  entityType: string,
  links: string[]
) {
  if (entityType !== 'user' && entityType !== 'community')
    return sendPacket(0, 'Invalid type');
  if (entityType === 'user' && !userID.equals(entityID))
    return sendPacket(0, `User ID doesn't match`);
  if (
    entityType === 'community' &&
    !(await Community.model.exists({ _id: entityID, admin: userID }))
  )
    return sendPacket(0, `Community doesn't exist or user is not admin`);

  const linkIDs = await ExternalLink.createLinks(entityID, entityType, links);

  if (entityType === 'user')
    await User.model.updateOne(
      { _id: userID },
      { $push: { links: { $each: linkIDs } } }
    );
  else
    await Community.model.updateOne(
      { _id: entityID },
      { $push: { links: { $each: linkIDs } } }
    );

  return sendPacket(1, `Added links to ${entityType}`);
}
