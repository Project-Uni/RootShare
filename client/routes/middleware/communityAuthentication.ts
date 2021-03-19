import { Types } from 'mongoose';

import { getUserFromJWT, log, sendPacket } from '../../helpers/functions';
import { Community } from '../../rootshare_db/models';

type ObjectIdType = Types.ObjectId;

export async function isCommunityAdmin(req, res, next) {
  const { communityID } = req.params;
  const user = getUserFromJWT(req);
  try {
    const community = await Community.model.findById(communityID);
    if (!(community.admin as ObjectIdType).equals(user._id)) {
      log(
        'info',
        `${user.firstName} ${user.lastName} tried to update the community ${community.name}, but failed because they are not the admin`
      );
      return res.json(
        sendPacket(0, 'User is not authorized to perform this request')
      );
    } else {
      return next();
    }
  } catch (err) {
    log('error', err);
    return res.json(sendPacket(-1, err));
  }
}

export async function isCommunityMember(req, res, next) {
  const { communityID } = req.params;
  const { _id: userID } = getUserFromJWT(req);

  const isMember = await Community.model.exists({
    _id: communityID,
    members: { $elemMatch: { $eq: userID } },
  });

  if (isMember) return next();
  else return res.json(sendPacket(-1, 'User is not a member of this community'));
}
