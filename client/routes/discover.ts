import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import {
  populateDiscoverForUser,
  exactMatchSearchFor,
  getSidebarData,
} from '../interactions/discover';
import { getUserFromJWT, sendPacket } from '../helpers/functions';
import { getQueryParams } from '../helpers/functions/getQueryParams';
import { SidebarData } from '../helpers/types';

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
      const reqQuery = getQueryParams(req, {
        query: { type: 'string' },
        limit: { type: 'number', optional: true },
      });
      if (!reqQuery)
        return res.status(500).json(sendPacket(-1, 'No query provided'));

      let { query, limit } = reqQuery;
      let typedLimit: number;
      if (limit) typedLimit = limit as number;

      const packet = await exactMatchSearchFor(userID, query as string, typedLimit);
      return res.json(packet);
    }
  );

  app.get('/api/v2/discover/sidebar', isAuthenticatedWithJWT, async (req, res) => {
    const { _id: userID } = getUserFromJWT(req);
    const query = getQueryParams(req, {
      dataSources: { type: 'string[]' },
    });

    if (!query) return res.status(500).json(sendPacket(-1, 'Invalid query params'));
    const { dataSources } = query;

    const packet = await getSidebarData(userID, dataSources as SidebarData[]);
    return res.json(packet);
  });
}
