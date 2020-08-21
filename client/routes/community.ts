import sendPacket from '../helpers/sendPacket';
import { Community } from '../models';
import { getCommunityValueFromType } from '../models/communities';

import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import log from '../helpers/logger';

export default function communityRoutes(app) {
  app.post(
    '/api/admin/community/create',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { name, description, adminID, type, isPrivate } = req.body;
      if (!name || !description || !adminID || !type || !isPrivate)
        return res.json(
          sendPacket(
            -1,
            'name, description, adminID, type, or isPrivate missing from request body.'
          )
        );

      const communityTypeValue = getCommunityValueFromType(type);
      if (!communityTypeValue) {
        return res.json(sendPacket(0, 'Invalid community type'));
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
        return res.json(
          sendPacket(1, 'Successfully created new community', {
            community: savedCommunity,
          })
        );
      } catch (err) {
        log('error', err);
        return res.json(sendPacket(0, `Failed to create community ${name}`));
      }
    }
  );
}
