import { Types } from 'mongoose';

import { SidebarData } from '../rootshare_db/types';
import {
  getUserFromJWT,
  sendPacket,
  getQueryParams,
  log,
} from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  populateDiscoverForUser,
  exactMatchSearchFor,
  getSidebarData,
} from '../interactions/discover';

const ObjectIdVal = Types.ObjectId;

export default function discoverRoutes(app) {
  app.get('/api/discover/populate', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const packet = await populateDiscoverForUser(userID);
    return res.json(packet);
  });

  app.get(
    '/api/discover/search/v1/exactMatch',
    isAuthenticatedWithJWT,
    async (req, res) => {
      const { _id: userID } = getUserFromJWT(req);
      const reqQuery = getQueryParams<{
        query: string;
        limit?: number;
      }>(req, {
        query: { type: 'string' },
        limit: { type: 'number', optional: true },
      });
      if (!reqQuery)
        return res.status(500).json(sendPacket(-1, 'No query provided'));

      let { query, limit } = reqQuery;

      const packet = await exactMatchSearchFor(userID, query, limit);
      return res.json(packet);
    }
  );

  app.get('/api/v2/discover/sidebar', isAuthenticatedWithJWT, async (req, res) => {
    try {
      const { _id: selfUserID } = getUserFromJWT(req);
      const query = getQueryParams<{
        dataSources: string[];
        communityID?: string;
        otherUserID?: string;
      }>(req, {
        dataSources: { type: 'string[]' },
        communityID: { type: 'string', optional: true },
        otherUserID: { type: 'string', optional: true },
      });

      if (!query)
        return res.status(500).json(sendPacket(-1, 'Invalid query params'));
      const { dataSources, communityID, otherUserID } = query;

      const packet = await getSidebarData(
        selfUserID,
        dataSources as SidebarData[],
        communityID && ObjectIdVal(communityID),
        otherUserID && ObjectIdVal(otherUserID)
      );
      return res.json(packet);
    } catch (err) {
      log('err', err.message);
      res.json(sendPacket(-1, err.message));
    }
  });
}
