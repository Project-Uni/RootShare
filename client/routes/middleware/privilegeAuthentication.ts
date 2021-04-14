import { getUserFromJWT, log, sendPacket } from '../../helpers/functions';
import { User } from '../../rootshare_db/models';
import { Request, Response, NextFunction } from 'express';

export const isRootshareAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: userID, privilegeLevel } = getUserFromJWT(req);
  if (privilegeLevel < 6) {
    res
      .status(401)
      .json(sendPacket(-1, 'User is not authorized to perform this action'));
  } else {
    try {
      const isAdmin = await User.model.exists({
        _id: userID,
        privilegeLevel: { $gte: 6 },
      });
      if (isAdmin) next();
      else
        res
          .status(401)
          .json(sendPacket(-1, 'User is not authorized to perform this action'));
    } catch (err) {
      res.status(500).json(sendPacket(-1, 'Something went wrong'));
    }
  }
};

export const isRootshareSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: userID, privilegeLevel } = getUserFromJWT(req);
  if (privilegeLevel < 9) {
    res
      .status(401)
      .json(sendPacket(-1, 'User is not authorized to perform this action'));
  } else {
    try {
      const isSuperAdmin = await User.model.exists({
        _id: userID,
        privilegeLevel: { $gte: 9 },
      });
      if (isSuperAdmin) next();
      else
        res
          .status(401)
          .json(sendPacket(-1, 'User is not authorized to perform this action'));
    } catch (err) {
      res.status(500).json(sendPacket(-1, 'Something went wrong'));
    }
  }
};
