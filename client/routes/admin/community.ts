import { isAuthenticatedWithJWT, isRootshareAdmin } from '.';
import { sendPacket } from '../../helpers/functions';
import { createNewCommunity } from '../../interactions/community';
import {
  retrieveAllCommunities,
  editCommunity,
  deleteCommunity,
} from '../../interactions/admin';

export default function adminCommunityRoutes(app) {
  app.post(
    '/api/admin/community/create',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const { name, description, adminID, type, isPrivate, isMTG } = req.body;
      if (
        !name ||
        !description ||
        !adminID ||
        !type ||
        isPrivate === null ||
        isPrivate === undefined
      )
        return res.json(
          sendPacket(
            -1,
            'name, description, adminID, type, or isPrivate missing from request body.'
          )
        );

      const packet = await createNewCommunity(
        name,
        description,
        adminID,
        type,
        isPrivate,
        { isMTG }
      );

      return res.json(packet);
    }
  );

  app.get(
    '/api/admin/community/all',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const packet = await retrieveAllCommunities();
      return res.json(packet);
    }
  );

  app.post(
    '/api/admin/community/edit',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const { _id, name, description, adminID, type, isPrivate, isMTG } = req.body;
      if (
        !_id ||
        !name ||
        !description ||
        !adminID ||
        !type ||
        isPrivate === null ||
        isPrivate === undefined
      )
        return res.json(
          sendPacket(
            -1,
            'name, description, adminID, type, or isPrivate missing from request body.'
          )
        );

      const packet = await editCommunity(
        _id,
        name,
        description,
        adminID,
        type,
        isPrivate,
        { isMTG }
      );

      return res.json(packet);
    }
  );

  app.delete(
    '/api/admin/community/:communityID',
    isAuthenticatedWithJWT,
    isRootshareAdmin,
    async (req, res) => {
      const { communityID } = req.params;
      const packet = await deleteCommunity(communityID);
      return res.json(packet);
    }
  );
}
