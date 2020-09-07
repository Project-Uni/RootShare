import log from '../../helpers/logger';
import sendPacket from '../../helpers/sendPacket';

import { Community } from '../../models';

export async function isCommunityAdmin(req, res, next) {
  const { communityID } = req.params;
  try {
    const community = await Community.findById(communityID);
    if (!community.admin.equals(req.user._id)) {
      log(
        'info',
        `${req.user.firstName} ${req.user.lastName} tried to update the profile picture for community ${community.name}, but failed because they are not the admin`
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
