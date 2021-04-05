import {
  getQueryParams,
  getUserFromJWT,
  log,
  sendPacket,
} from '../../helpers/functions';
import { Community } from '../../models';
import { Request, Response, NextFunction } from 'express';
import { CommunityC } from '../../models/communities';

const mongoose = require('mongoose');

export async function isCommunityAdmin(req, res, next) {
  const { communityID } = req.params;
  const user = getUserFromJWT(req);
  try {
    const community = await Community.findById(communityID);
    if (!community.admin.equals(user._id)) {
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

  const isMember = await Community.exists(
    { _id: communityID },
    { members: { $elemMatch: { $eq: mongoose.Types.ObjectId(userID) } } }
  );

  if (isMember) return next();
  else return res.json(sendPacket(-1, 'User is not a member of this community'));
}

/**
 *
 * @param req
 * @param res
 * @param next
 */

export const isCommunityAdminFromQueryParams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: userID } = getUserFromJWT(req);
  const query = getQueryParams(req, {
    communityID: { type: 'string' },
  });
  if (!query)
    return res.status(500).json(sendPacket(-1, 'Missing query param communityID'));

  let { communityID } = query;
  communityID = communityID as string;

  //TODO - Might need to update to use objectID here
  const isAdmin = await CommunityC.model.exists({ _id: communityID, admin: userID });
  if (isAdmin) next();
  else res.status(401).json(sendPacket(-1, 'User is not community admin'));
};

export const isCommunityMemberFromQueryParams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: userID } = getUserFromJWT(req);
  const query = getQueryParams(req, {
    communityID: { type: 'string' },
  });
  if (!query)
    return res.status(500).json(sendPacket(-1, 'Missing query param communityID'));

  let { communityID } = query;
  communityID = communityID as string;

  const isMember = await CommunityC.model.exists({
    _id: communityID,
    members: { $elemMatch: { $eq: mongoose.Types.ObjectId(userID) } },
  });

  if (isMember) next();
  else res.status(401).json(sendPacket(-1, 'User is not community member'));
};
