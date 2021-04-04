import { SidebarData } from '../rootshare_db/types';
import { getUserFromJWT, sendPacket, getQueryParams } from '../helpers/functions';
import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  populateDiscoverForUser,
  exactMatchSearchFor,
  getSidebarData,
} from '../interactions/discover';

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
    const { _id: userID } = getUserFromJWT(req);
    const query = getQueryParams<{
      dataSources: string[];
    }>(req, {
      dataSources: { type: 'string[]' },
    });

    if (!query) return res.status(500).json(sendPacket(-1, 'Invalid query params'));
    const { dataSources } = query;

    const packet = await getSidebarData(userID, dataSources as SidebarData[]);
    return res.json(packet);
  });
}
